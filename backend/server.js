import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // In production, we'd limit this to our frontend domain, but for demo and deployment ease, allow all
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection
connectDB();

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Base route for status checks
app.get('/', (req, res) => {
  res.json({
    name: "Rose Bud API Service",
    status: "Healthy",
    time: new Date(),
    mongodb: connectDB ? "Connected or Falling Back gracefully" : "Offline"
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Rose Bud Server is running on port ${PORT}`);
});
