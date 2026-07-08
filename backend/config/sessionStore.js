import bcrypt from 'bcryptjs';
import { seedProducts } from './db.js';

// Global In-Memory Store for resilient zero-config fallback mode
export const memoryUsers = [];
export const memoryOrders = [];

// Seed memory users with a default admin
const seedMemoryAdmin = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    memoryUsers.push({
      _id: 'mem_user_admin',
      name: 'Rose Bud Admin',
      email: 'admin@rosebud.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("🌱 In-memory session store seeded with default admin: admin@rosebud.com");
  } catch (err) {
    console.error("Failed to seed in-memory admin:", err);
  }
};

// Immediately seed the admin
seedMemoryAdmin();

export const memoryProducts = seedProducts.map((p, idx) => ({
  _id: `mem_prod_${idx + 1}`,
  ...p,
  createdAt: new Date(),
  updatedAt: new Date()
}));

export const getMemoryUserById = (id) => memoryUsers.find(u => u._id === id);
export const getMemoryUserByEmail = (email) => memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
export const addMemoryUser = (user) => {
  memoryUsers.push(user);
  return user;
};
