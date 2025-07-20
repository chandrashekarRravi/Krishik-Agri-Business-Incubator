import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';
const [,, email, password, name, phone, address] = process.argv;

if (!email || !password || !name || !phone || !address) {
  console.error('Usage: node backend/scripts/createAdminUser.js <email> <password> <name> <phone> <address>');
  process.exit(1);
}
dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/krishik-agri';

(async () => {
  await mongoose.connect(MONGO_URI);
  let user = await User.findOne({ email });
  if (user) {
    user.isAdmin = true;
    await user.save();
    console.log('User promoted to admin:', user.email);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, phone, address, password: hashedPassword, isAdmin: true });
    await user.save();
    console.log('Admin user created:', user.email);
  }
  await mongoose.disconnect();
  process.exit(0);
})(); 