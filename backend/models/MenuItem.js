import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'Main' }
}, { timestamps: true });

export default mongoose.model('MenuItem', MenuItemSchema);

