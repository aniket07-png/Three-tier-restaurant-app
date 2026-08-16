// --- (backend/server.js) ---
// Modern ESM import syntax requires the file extension (.js)
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem.js';
import Order from './models/Order.js';

dotenv.config();

const app = express();

// Standard Express Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Tier 1 $\rightarrow$ Tier 2 Call: Fetch All Menu Items
app.get('/api/menu', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tier 1 $\rightarrow$ Tier 2 Call: Fetch Order History
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tier 1 $\rightarrow$ Tier 2 Call: Place a New Order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, tableNumber, items } = req.body;
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const order = await Order.create({ customerName, tableNumber, items, totalAmount });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Tier 1 $\rightarrow$ Tier 2 Call: Update Order Status (e.g., Prepared, Delivered)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- TIER 3 INTEGRATION: Database Connection & Seeding ---

// Data Seeding Function: Populates MongoDB with default items if empty.
async function seedDB() {
  try {
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      await MenuItem.insertMany([
        { 
          name: 'Artisan Burger', 
          description: 'Brioche bun, wagyu patty & cheddar', 
          price: 14.99, 
          category: 'Main',
          // Pattern A: Absolute URL from AWS S3
          imageUrl: 'https://my-food-bucket-demo.s3.ap-southeast-2.amazonaws.com/f6be2fcf-8afd-455c-8650-4ba565956c66_830883+SS.jpg' 
        },
        { 
          name: 'Truffle Fries', 
          description: 'Crispy skin-on fries with truffle oil', 
          price: 6.50, 
          category: 'Sides',
          // Pattern B: Relative URL (requires embedded images/ folder in frontend/public)
          imageUrl: 'https://my-food-bucket-demo.s3.ap-southeast-2.amazonaws.com/images+(2).jpeg' 
        },
        { 
          name: 'Craft IPA', 
          description: 'Locally brewed India Pale Ale', 
          price: 5.50, 
          category: 'Drinks',
          imageUrl: 'https://my-food-bucket-demo.s3.ap-southeast-2.amazonaws.com/images+(1).jpeg'
        },
        { 
          name: 'Lava Cake', 
          description: 'Molten Belgian dark chocolate cake', 
          price: 7.00, 
          category: 'Dessert',
          imageUrl: 'https://my-food-bucket-demo.s3.ap-southeast-2.amazonaws.com/images.jpeg'
        }
      ]);
      console.log('🌱 Seeded initial menu items with image references');
    }
  } catch (err) {
    console.error('Data seeding error:', err);
  }
}

// Global Configuration
const PORT = process.env.PORT || 5000;
// Default MONGO_URI is optimized for the internal Docker network
const MONGO_URI = process.env.MONGO_URI || 'mongodb://database:27017/restaurant_db';

// Connect to MongoDB, then seed data, then start the Express server
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Tier 2 Connected to Tier 3 (MongoDB)');
    await seedDB();
    // Use 0.0.0.0 so the application is accessible outside the container
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Backend API Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Mongoose connection failure:', err);
    process.exit(1); // Exit process if database connection fails
  });

