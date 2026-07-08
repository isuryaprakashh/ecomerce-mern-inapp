import React, { useState } from 'react';
import { X, Lock, RefreshCw, CreditCard } from 'lucide-react';
import { api } from '../utils/api.js';

export default function CheckoutModal({ cartItems, onClose, onOrderComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mockPaymentState, setMockPaymentState] = useState(null); // 'selecting', 'processing'

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal >= 5000 ? 0 : 350;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const orderItems = cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const orderData = {
        amount: total,
        items: orderItems,
        shippingDetails: formData
      };

      // Create Order in backend/api
      const response = await api.createOrder(orderData);

      if (!response.success) {
        throw new Error(response.message || "Failed to initiate transaction");
      }

      if (response.useMock) {
        // --- MOCK FLOW ACTIVE ---
        setMockPaymentState('selecting');
        
        // Save the mock details to trigger verification
        const handleMockPayment = async (status) => {
          setIsProcessing(true);
          setMockPaymentState('processing');
          
          // Wait for smooth visual simulation
          await new Promise(resolve => setTimeout(resolve, 1500));

          if (status === 'success') {
            const verification = await api.verifyPayment({
              razorpay_order_id: response.order.id,
              razorpay_payment_id: `mock_pay_${Date.now()}`,
              useMock: true
            });
            
            if (verification.success) {
              onOrderComplete({
                orderId: verification.orderId,
                paymentId: verification.paymentId,
                amount: total,
                shippingDetails: formData
              });
            } else {
              setErrorMessage("Mock payment verification failed");
              setIsProcessing(false);
              setMockPaymentState(null);
            }
          } else {
            setErrorMessage("Simulated payment transaction was declined by the bank.");
            setIsProcessing(false);
            setMockPaymentState(null);
          }
        };

        // We export this handler to the render cycle so user can select
        window.executeMockCheckoutStatus = handleMockPayment;
      } else {
        // --- REAL RAZORPAY FLOW ACTIVE ---
        if (!window.Razorpay) {
          throw new Error("Razorpay payment script failed to load. Please check your internet connection.");
        }

        const options = {
          key: response.razorpayKeyId,
          amount: response.order.amount,
          currency: response.order.currency,
          name: "Rose Bud Skincare",
          description: "Order Checkout Transaction",
          order_id: response.order.id,
          handler: async function (rzpResponse) {
            try {
              setIsProcessing(true);
              const verification = await api.verifyPayment({
                razorpay_order_id: rzpResponse.razorpay_order_id,
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_signature: rzpResponse.razorpay_signature,
                useMock: false
              });

              if (verification.success) {
                onOrderComplete({
                  orderId: verification.orderId,
                  paymentId: verification.paymentId,
                  amount: total,
                  shippingDetails: formData
                });
              } else {
                setErrorMessage("Payment verification failed. Please contact support.");
              }
            } catch (err) {
              setErrorMessage("Verification error: " + err.message);
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: "#8F5E52"
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={isProcessing ? undefined : onClose}>
      <div className="modal-content checkout-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        {!isProcessing && (
          <button className="modal-close-btn" onClick={onClose} aria-label="Close checkout">
            <X size={18} />
          </button>
        )}

        {mockPaymentState === 'processing' ? (
          /* Mock payment processing screen */
          <div className="flex-center" style={{ flexDirection: 'column', height: '350px', gap: '20px' }}>
            <RefreshCw className="spinning" size={40} color="var(--accent-rose)" />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>Authorizing Secure Transaction</h3>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '300px' }}>
              Please do not refresh this page. Communicating with bank servers...
            </p>
            <style>{`
              .spinning { animation: spin 1.2s linear infinite; }
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </div>
        ) : mockPaymentState === 'selecting' ? (
          /* Mock payment simulation choice page */
          <div className="flex-center" style={{ flexDirection: 'column', padding: '20px 0', gap: '24px' }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '20px',
              borderRadius: '4px',
              textAlign: 'center',
              width: '100%'
            }}>
              <span style={{ fontSize: '2rem' }}>💳</span>
              <h3 style={{ margin: '10px 0', fontSize: '1.4rem' }}>Zero-Config Payment Gateway</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Rose Bud has engaged the Simulated Mock Payment flow since Razorpay environment variables are not set. Test checkout success/decline below.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
              <button 
                className="btn-primary" 
                style={{ flex: 1, backgroundColor: 'var(--success-color)' }}
                onClick={() => window.executeMockCheckoutStatus?.('success')}
              >
                Approve Payment (Success)
              </button>
              <button 
                className="btn-secondary" 
                style={{ flex: 1, borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}
                onClick={() => window.executeMockCheckoutStatus?.('fail')}
              >
                Decline Payment (Fail)
              </button>
            </div>
          </div>
        ) : (
          /* Standard Checkout Form */
          <>
            <h2 className="checkout-title">Shipping & Payment</h2>

            {errorMessage && (
              <div style={{
                backgroundColor: '#FDF2F2',
                border: '1px solid #FDE8E8',
                color: '#E02424',
                padding: '12px 16px',
                borderRadius: '2px',
                fontSize: '0.85rem',
                marginBottom: '20px'
              }}>
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="checkout-form">
              {/* Form Input fields */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="E.g., Jane Doe"
                  disabled={isProcessing}
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    placeholder="jane.doe@example.com"
                    disabled={isProcessing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    placeholder="+91 98765 43210"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <input 
                  type="text" 
                  name="address" 
                  required 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="Street Address, Apartment, Suite"
                  disabled={isProcessing}
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input 
                    type="text" 
                    name="city" 
                    required 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    placeholder="New Delhi"
                    disabled={isProcessing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input 
                    type="text" 
                    name="postalCode" 
                    required 
                    value={formData.postalCode} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    placeholder="110001"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Order total display */}
              <div className="checkout-summary-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span>Items Total</span>
                  <span>₹{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span>Standard Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 600 }}>
                  <span>Total Amount</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Checkout Submit CTA */}
              <button 
                type="submit" 
                className="btn-primary checkout-submit-btn" 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="spinning" size={16} /> Generating Order ID...
                  </>
                ) : (
                  <>
                    <Lock size={16} /> Initiate Payment Gateway (₹{total})
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
