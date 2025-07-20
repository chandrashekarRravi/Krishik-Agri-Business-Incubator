import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
  dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/krishik-agri';

(async () => {
  await mongoose.connect(MONGO_URI);
  const users = await User.find();
  console.log(users);
  await mongoose.disconnect();
  process.exit(0);
})(); 