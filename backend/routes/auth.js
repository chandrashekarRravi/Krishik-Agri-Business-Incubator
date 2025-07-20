import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import User from '../models/User.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Register
router.post('/register', upload.single('profile'), async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;
    const profile = req.file ? req.file.filename : null;
    if (!name || !email || !phone || !address || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phone, address, password: hashedPassword, profile });
    await user.save();
    // Remove password from user object
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ message: 'User registered successfully', user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    // Remove password from user object
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add a new shipping address
router.post('/address', async (req, res) => {
  try {
    const { userId, label, address, isDefault } = req.body;
    if (!userId || !address) return res.status(400).json({ message: 'userId and address are required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    user.addresses.push({ label, address, isDefault });
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add address', error: err.message });
  }
});
// Edit an address
router.put('/address/:userId/:index', async (req, res) => {
  try {
    const { userId, index } = req.params;
    const { label, address, isDefault } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.addresses[index]) {
      if (isDefault) user.addresses.forEach(addr => addr.isDefault = false);
      user.addresses[index] = { label, address, isDefault };
      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to edit address', error: err.message });
  }
});
// Delete an address
router.delete('/address/:userId/:index', async (req, res) => {
  try {
    const { userId, index } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.addresses.splice(index, 1);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete address', error: err.message });
  }
});
// Set default address
router.patch('/address/:userId/default/:index', async (req, res) => {
  try {
    const { userId, index } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.addresses.forEach((addr, i) => addr.isDefault = i === Number(index));
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to set default address', error: err.message });
  }
});

// Get user by ID (for addresses and profile)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

// Admin auth middleware
export function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (!decoded.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Get all users (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});
// Delete user (admin only)
router.delete('/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

// Promote user to admin
router.patch('/:userId/promote', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { isAdmin: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User promoted to admin', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to promote user', error: err.message });
  }
});

export default router; 