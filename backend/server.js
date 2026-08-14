import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem.js';
import Order from './models/Order.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/menu', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Seed sample data if empty
async function seedDB() {
  const count = await MenuItem.countDocuments();
  if (count === 0) {
    await MenuItem.insertMany([
      { name: 'Artisan Burger', description: 'Brioche bun, wagyu patty & cheddar', price: 14.99, category: 'Main' },
      { name: 'Truffle Fries', description: 'Crispy skin-on fries with truffle oil', price: 6.50, category: 'Sides' },
      { name: 'Craft IPA', description: 'Locally brewed India Pale Ale', price: 5.50, category: 'Drinks' },
      { name: 'Lava Cake', description: 'Molten Belgian dark chocolate cake', price: 7.00, category: 'Dessert' }
    ]);
    console.log('Seeded initial menu items');
  }
}

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://database:27017/restaurant_db';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedDB();
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB error:', err));

