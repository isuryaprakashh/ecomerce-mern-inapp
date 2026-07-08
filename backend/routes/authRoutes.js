import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { checkMongoConnection } from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getMemoryUserByEmail, 
  addMemoryUser 
} from '../config/sessionStore.js';

const router = express.Router();

const generateToken = (user) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'rosebudsecretkey';
  return jwt.sign(
    { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    }, 
    JWT_SECRET, 
    { expiresIn: '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (checkMongoConnection()) {
      // --- MongoDB Auth Flow ---
      const userExists = await User.findOne({ email });

      if (userExists) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const user = await User.create({
        name,
        email,
        password, // hashed inside pre-save middleware
        role: 'user' // default registration role
      });

      if (user) {
        return res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user)
        });
      } else {
        return res.status(400).json({ message: "Invalid user data" });
      }
    } else {
      // --- In-Memory Auth Fallback Flow ---
      const userExists = getMemoryUserByEmail(email);
      if (userExists) {
        return res.status(400).json({ message: "User already exists in in-memory session" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUserId = `mem_user_${Date.now()}`;

      const user = {
        _id: newUserId,
        name,
        email,
        password: hashedPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addMemoryUser(user);

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user)
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Failed to register user", error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    if (checkMongoConnection()) {
      // --- MongoDB Login Flow ---
      const user = await User.findOne({ email });

      if (user && (await user.matchPassword(password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user)
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    } else {
      // --- In-Memory Login Fallback Flow ---
      const user = getMemoryUserByEmail(email);

      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user)
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password in session fallback" });
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login user", error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  if (req.user) {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });
  } else {
    res.status(404).json({ message: "User profile not found" });
  }
});

export default router;
