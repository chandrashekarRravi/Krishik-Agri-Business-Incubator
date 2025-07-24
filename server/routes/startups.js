import express from 'express';
import Startup from '../models/Startup.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Admin auth middleware (copied from products.js)
function adminAuth(req, res, next) {
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

// Get all startups
router.get('/', async (req, res) => {
  try {
    const startups = await Startup.find();
    res.json(startups);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch startups', error: err.message });
  }
});

// Get a single startup by ID
router.get('/:id', async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    res.json(startup);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch startup', error: err.message });
  }
});

// Create a new startup (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const startup = new Startup(req.body);
    await startup.save();
    res.status(201).json(startup);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create startup', error: err.message });
  }
});

// Update a startup (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const startup = await Startup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    res.json(startup);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update startup', error: err.message });
  }
});

// Delete a startup (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const startup = await Startup.findByIdAndDelete(req.params.id);
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    res.json({ message: 'Startup deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete startup', error: err.message });
  }
});

export default router; 