import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});
  
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  startup: String,
  quantity: String,
  price: String,
  contact: {
    name: String,
    phone: String,
    email: String,
  },
  image: [String],
  reviews: [reviewSchema],
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ startup: 1 });
productSchema.index({ createdAt: -1 });

// Duplicate prevention index removed as per requirements. Now, duplicate products are allowed.

export default mongoose.model('Product', productSchema); 