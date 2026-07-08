import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { checkMongoConnection } from '../config/db.js';
import { getMemoryUserById } from '../config/sessionStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const JWT_SECRET = process.env.JWT_SECRET || 'rosebudsecretkey';
      const decoded = jwt.verify(token, JWT_SECRET);

      if (checkMongoConnection()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        req.user = getMemoryUserById(decoded.id);
      }

      // If user wasn't found in DB or memory, but token is valid, construct profile from payload
      if (!req.user && decoded) {
        req.user = {
          _id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role
        };
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};
