import mongoose from 'mongoose';

const StartupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  focusArea: { type: String, required: true },
  description: { type: String, required: true },
  contact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  productCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
});

// Unique compound index for strict duplicate prevention
StartupSchema.index({ name: 1, focusArea: 1, 'contact.email': 1, 'contact.phone': 1 }, { unique: true });

const Startup = mongoose.model('Startup', StartupSchema);
export default Startup; 