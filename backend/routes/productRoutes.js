import express from 'express';
import Product from '../models/Product.js';
import { checkMongoConnection } from '../config/db.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { memoryProducts } from '../config/sessionStore.js';

const router = express.Router();

// GET all products with filtering & search
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    
    if (checkMongoConnection()) {
      // MongoDB Flow
      let query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      let queryExec = Product.find(query);
      
      if (sort === 'price-low') {
        queryExec = queryExec.sort({ price: 1 });
      } else if (sort === 'price-high') {
        queryExec = queryExec.sort({ price: -1 });
      } else if (sort === 'rating') {
        queryExec = queryExec.sort({ rating: -1 });
      }
      
      const products = await queryExec;
      return res.json(products);
    } else {
      // In-Memory Fallback Flow
      let products = [...memoryProducts];
      
      // Filter by category
      if (category && category !== 'All') {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      
      // Filter by search query
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort products
      if (sort === 'price-low') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-high') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      }
      
      return res.json(products);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error fetching products", error: error.message });
  }
});

// GET single product details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (checkMongoConnection()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      return res.json(product);
    } else {
      // In-Memory Fallback
      const product = memoryProducts.find(p => p._id === id);
      if (product) return res.json(product);
      return res.status(404).json({ message: "Product not found in memory" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error fetching product", error: error.message });
  }
});

// @route   POST /api/products
// @desc    Create a new product (Admin only)
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, description, price, category, image, ingredients, benefits } = req.body;

    if (!name || !description || !price || !category || !image || !ingredients || !benefits) {
      return res.status(400).json({ message: "All product fields are required" });
    }

    const parsedPrice = parseFloat(price);

    if (checkMongoConnection()) {
      const product = new Product({
        name,
        description,
        price: parsedPrice,
        category,
        image,
        ingredients,
        benefits,
        rating: 5.0,
        reviewsCount: 1
      });
      const createdProduct = await product.save();
      res.status(201).json(createdProduct);
    } else {
      // In-Memory fallback
      const newProduct = {
        _id: `mem_prod_${Date.now()}`,
        name,
        description,
        price: parsedPrice,
        category,
        image,
        ingredients,
        benefits,
        rating: 5.0,
        reviewsCount: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryProducts.push(newProduct);
      res.status(201).json(newProduct);
    }
  } catch (error) {
    res.status(500).json({ message: "Server failed to create product", error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product (Admin only)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, description, price, category, image, ingredients, benefits } = req.body;
    const { id } = req.params;

    if (checkMongoConnection()) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price !== undefined ? parseFloat(price) : product.price;
      product.category = category || product.category;
      product.image = image || product.image;
      product.ingredients = ingredients || product.ingredients;
      product.benefits = benefits || product.benefits;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      // In-Memory Fallback
      const productIndex = memoryProducts.findIndex(p => p._id === id);
      if (productIndex === -1) {
        return res.status(404).json({ message: "Product not found in memory" });
      }

      const existing = memoryProducts[productIndex];
      const updated = {
        ...existing,
        name: name || existing.name,
        description: description || existing.description,
        price: price !== undefined ? parseFloat(price) : existing.price,
        category: category || existing.category,
        image: image || existing.image,
        ingredients: ingredients || existing.ingredients,
        benefits: benefits || existing.benefits,
        updatedAt: new Date()
      };

      memoryProducts[productIndex] = updated;
      res.json(updated);
    }
  } catch (error) {
    res.status(500).json({ message: "Server failed to update product", error: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;

    if (checkMongoConnection()) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      await Product.findByIdAndDelete(id);
      res.json({ message: "Product successfully deleted" });
    } else {
      // In-Memory Fallback
      const productIndex = memoryProducts.findIndex(p => p._id === id);
      if (productIndex === -1) {
        return res.status(404).json({ message: "Product not found in memory" });
      }
      memoryProducts.splice(productIndex, 1);
      res.json({ message: "Product successfully deleted from memory" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server failed to delete product", error: error.message });
  }
});

export default router;
