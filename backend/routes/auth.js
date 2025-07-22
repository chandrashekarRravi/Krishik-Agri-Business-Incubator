import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();
// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'krishik-profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});
const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// Rate limiters
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 200 requests per windowMs
  message: { message: 'Too many requests, please try again later.' }
});
export const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { message: 'Too many requests, please try again later.' }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               password:
 *                 type: string
 *               profile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
// Register
router.post('/register', authLimiter,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, email, phone, address, password } = req.body;
      // Remove profile image logic
      const profile = null;
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
      console.error('Registration error:', err && err.stack ? err.stack : JSON.stringify(err));
      res.status(500).json({ message: 'Internal server error', error: err && err.message ? err.message : JSON.stringify(err) });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
// Login
router.post('/login', authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
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

/**
 * @swagger
 * /api/auth/address:
 *   post:
 *     summary: Add a new shipping address
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               label:
 *                 type: string
 *               address:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address added
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Add a new shipping address
router.post('/address', userAuth, async (req, res) => {
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
/**
 * @swagger
 * /api/auth/address/{userId}/{index}:
 *   put:
 *     summary: Edit a shipping address
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: index
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               address:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
// Edit an address
router.put('/address/:userId/:index', userAuth, async (req, res) => {
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
/**
 * @swagger
 * /api/auth/address/{userId}/{index}:
 *   delete:
 *     summary: Delete a shipping address
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: index
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Address deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
// Delete an address
router.delete('/address/:userId/:index', userAuth, async (req, res) => {
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
/**
 * @swagger
 * /api/auth/address/{userId}/default/{index}:
 *   patch:
 *     summary: Set default shipping address
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: index
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Default address set
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
// Set default address
router.patch('/address/:userId/default/:index', userAuth, async (req, res) => {
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

/**
 * @swagger
 * /api/auth/{userId}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
// Get user by ID (for addresses and profile)
router.get('/:userId', userAuth, async (req, res) => {
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

// User auth middleware
export function userAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

/**
 * @swagger
 * /api/auth:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
// Get all users (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});
/**
 * @swagger
 * /api/auth/{userId}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
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

export { router as authRouter };

export default router; 