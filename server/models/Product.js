import mongoose from 'mongoose';
import { mapCategoryToFocusAreas, getPrimaryFocusArea } from '../utils/categoryMapping.js';

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
  // Focus area information automatically assigned based on category
  focusAreas: [{
    id: String,
    icon: String,
    title: String
  }],
  primaryFocusArea: {
    id: String,
    icon: String,
    title: String
  }
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ startup: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'primaryFocusArea.id': 1 });

// Pre-save middleware to automatically assign focus areas based on category
productSchema.pre('save', function(next) {
  if (this.category && (!this.focusAreas || this.focusAreas.length === 0)) {
    this.focusAreas = mapCategoryToFocusAreas(this.category);
    this.primaryFocusArea = getPrimaryFocusArea(this.category);
  }
  next();
});

// Pre-update middleware for findOneAndUpdate operations
productSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  const update = this.getUpdate();
  if (update.category) {
    update.focusAreas = mapCategoryToFocusAreas(update.category);
    update.primaryFocusArea = getPrimaryFocusArea(update.category);
  }
  next();
});

// Duplicate prevention index removed as per requirements. Now, duplicate products are allowed.

export default mongoose.model('Product', productSchema); 