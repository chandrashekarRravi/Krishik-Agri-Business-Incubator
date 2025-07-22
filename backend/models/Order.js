import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  productName: { type: String, required: true },
  orderNumber: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'Processing' },
  shippingAddress: { type: String },
  estimatedDelivery: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

orderSchema.index({ user: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema); 