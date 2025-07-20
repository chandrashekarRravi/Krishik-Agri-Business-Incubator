import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  addresses: [{
    label: { type: String },
    address: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  }],
  password: { type: String, required: true },
  profile: { type: String },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('User', userSchema); 