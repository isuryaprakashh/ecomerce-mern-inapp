import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import { checkMongoConnection } from '../config/db.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { memoryOrders } from '../config/sessionStore.js';

const router = express.Router();

// Initialize Razorpay client
let razorpay = null;
const isRazorpayConfigured = () => {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
};

const getRazorpayInstance = () => {
  if (!razorpay && isRazorpayConfigured()) {
    try {
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    } catch (e) {
      console.error("Failed to initialize Razorpay:", e.message);
      razorpay = null;
    }
  }
  return razorpay;
};

// Create a new order (Razorpay or Mock, optional user binding)
router.post('/create', async (req, res) => {
  try {
    const { amount, items, shippingDetails } = req.body;
    
    if (!amount || !items || !shippingDetails) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    // Optional user parsing (if authorization token is passed)
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const JWT_SECRET = process.env.JWT_SECRET || 'rosebudsecretkey';
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.warn("Optional user authentication ignored during checkout:", err.message);
      }
    }

    const orderAmountInPaise = Math.round(amount * 100);
    const uniqueReceipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const rzp = getRazorpayInstance();

    if (rzp) {
      // --- REAL RAZORPAY INTEGRATION FLOW ---
      const options = {
        amount: orderAmountInPaise,
        currency: 'INR',
        receipt: uniqueReceipt,
      };

      const rzpOrder = await rzp.orders.create(options);
      
      const newOrderData = {
        orderId: rzpOrder.id,
        userId: userId,
        amount: amount,
        currency: 'INR',
        status: 'created',
        items: items,
        shippingDetails: shippingDetails
      };

      if (checkMongoConnection()) {
        const order = new Order(newOrderData);
        await order.save();
      } else {
        memoryOrders.push(newOrderData);
      }

      return res.json({
        success: true,
        useMock: false,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        order: {
          id: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          receipt: rzpOrder.receipt
        }
      });
    } else {
      // --- MOCK PAYMENT FLOW (Fallback) ---
      const mockOrderId = `mock_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      const newOrderData = {
        orderId: mockOrderId,
        userId: userId,
        amount: amount,
        currency: 'INR',
        status: 'created',
        items: items,
        shippingDetails: shippingDetails
      };

      if (checkMongoConnection()) {
        const order = new Order(newOrderData);
        await order.save();
      } else {
        memoryOrders.push(newOrderData);
      }

      return res.json({
        success: true,
        useMock: true,
        order: {
          id: mockOrderId,
          amount: orderAmountInPaise,
          currency: 'INR',
          receipt: uniqueReceipt
        }
      });
    }
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
});

// Verify payment signature
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, useMock } = req.body;

    if (useMock) {
      // --- MOCK VERIFICATION ---
      const mockOrderId = razorpay_order_id;
      const simulatedPaymentId = razorpay_payment_id || `mock_pay_${Date.now()}`;
      
      if (checkMongoConnection()) {
        const order = await Order.findOne({ orderId: mockOrderId });
        if (order) {
          order.status = 'paid';
          order.paymentId = simulatedPaymentId;
          await order.save();
        }
      } else {
        const orderIndex = memoryOrders.findIndex(o => o.orderId === mockOrderId);
        if (orderIndex !== -1) {
          memoryOrders[orderIndex].status = 'paid';
          memoryOrders[orderIndex].paymentId = simulatedPaymentId;
        }
      }

      return res.json({
        success: true,
        message: "Payment simulated successfully",
        orderId: mockOrderId,
        paymentId: simulatedPaymentId
      });
    }

    // --- REAL RAZORPAY VERIFICATION ---
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing Razorpay verification tokens" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      if (checkMongoConnection()) {
        const order = await Order.findOne({ orderId: razorpay_order_id });
        if (order) {
          order.status = 'paid';
          order.paymentId = razorpay_payment_id;
          order.signature = razorpay_signature;
          await order.save();
        }
      } else {
        const orderIndex = memoryOrders.findIndex(o => o.orderId === razorpay_order_id);
        if (orderIndex !== -1) {
          memoryOrders[orderIndex].status = 'paid';
          memoryOrders[orderIndex].paymentId = razorpay_payment_id;
          memoryOrders[orderIndex].signature = razorpay_signature;
        }
      }

      return res.json({
        success: true,
        message: "Payment verified successfully",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
    } else {
      if (checkMongoConnection()) {
        const order = await Order.findOne({ orderId: razorpay_order_id });
        if (order) {
          order.status = 'failed';
          await order.save();
        }
      }
      return res.status(400).json({ success: false, message: "Invalid signature verification failed" });
    }
  } catch (error) {
    console.error("Order verification error:", error);
    res.status(500).json({ message: "Failed to verify order payment", error: error.message });
  }
});

// GET all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    if (checkMongoConnection()) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      // Sort memory orders descending by timestamp
      const sortedMemory = [...memoryOrders].reverse();
      return res.json(sortedMemory);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error fetching orders", error: error.message });
  }
});

// GET currently logged in user's orders list
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    if (checkMongoConnection()) {
      const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      const userMemoryOrders = memoryOrders
        .filter(o => o.userId === userId)
        .reverse();
      return res.json(userMemoryOrders);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error fetching personal orders", error: error.message });
  }
});

export default router;
