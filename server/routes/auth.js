import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import twilio from 'twilio';

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

// Twilio configuration with error handling
let twilioClient = null;
const phoneVerifications = {};

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio SMS service configured successfully');
  } else {
    console.warn('Twilio configuration incomplete. SMS features will be disabled.');
    console.warn('Required environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
  }
} catch (error) {
  console.error('Failed to initialize Twilio client:', error.message);
  twilioClient = null;
}

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
 *     summary: Login a user with email or phone
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *                 description: Email address or phone number
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
    body('emailOrPhone').notEmpty().withMessage('Email or phone is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { emailOrPhone, password } = req.body;
      
      // Determine if input is email or phone
      const isEmail = emailOrPhone.includes('@');
      const isPhone = /^[\+]?[0-9\s\-\(\)]{10,}$/.test(emailOrPhone.replace(/\s/g, ''));
      
      if (!isEmail && !isPhone) {
        return res.status(400).json({ message: 'Please enter a valid email address or phone number' });
      }
      
      // Find user by email or phone
      let user;
      if (isEmail) {
        user = await User.findOne({ email: emailOrPhone });
      } else {
        // Clean phone number (remove spaces, dashes, parentheses)
        const cleanPhone = emailOrPhone.replace(/[\s\-\(\)]/g, '');
        // Try with +91 prefix if not present
        const phoneWithCountryCode = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;
        const phoneWithoutCountryCode = cleanPhone.startsWith('+91') ? cleanPhone.substring(3) : cleanPhone;
        
        user = await User.findOne({ 
          $or: [
            { phone: cleanPhone },
            { phone: phoneWithCountryCode },
            { phone: phoneWithoutCountryCode }
          ]
        });
      }
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check if password needs to be reset (6 months old)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const passwordNeedsReset = user.passwordChangedAt < sixMonthsAgo;
      
      if (passwordNeedsReset) {
        // Generate OTP for password reset
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        // Store OTP for this user
        passwordResetOTPs[user._id.toString()] = {
          otp,
          expiresAt,
          email: user.email,
          phone: user.phone
        };
        
        // Send OTP to phone
        if (twilioClient) {
          try {
            await twilioClient.messages.create({
              body: `Your Krishik password reset code is: ${otp}. Your password is older than 6 months and needs to be reset. This code expires in 10 minutes.`,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: user.phone.startsWith('+') ? user.phone : `+91${user.phone}`
            });
            console.log(`SMS sent successfully to ${user.phone}`);
          } catch (phoneErr) {
            console.error('Failed to send SMS:', phoneErr.message);
          }
        } else {
          console.warn('Twilio not configured. SMS not sent to:', user.phone);
        }
        
        // Log OTP for email (implement email service as needed)
        console.log(`Password reset OTP for ${user.email}: ${otp}`);
        
        return res.status(200).json({ 
          message: 'Password reset required. OTP sent to your registered email and phone.',
          requiresPasswordReset: true,
          userId: user._id,
          otpSent: true
        });
      }
      
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

/**
 * @swagger
 * /api/auth/profile/{userId}:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
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
 *               profile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
// Update user profile
router.put('/profile/:userId', userAuth, profileUpload.single('profile'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, address } = req.body;
    
    // Check if user exists and is authorized
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already exists' });
      }
    }
    
    // Prepare update data
    const updateData = { name, email, phone, address };
    
    // Handle profile image upload
    if (req.file) {
      updateData.profile = req.file.path;
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    // Remove password from response
    const userObj = updatedUser.toObject();
    delete userObj.password;
    
    res.json({ message: 'Profile updated successfully', user: userObj });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
});

// Send phone verification code
router.post('/send-phone-code', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone number is required' });
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  phoneVerifications[phone] = code;
  if (twilioClient) {
    try {
      await twilioClient.messages.create({
        body: `Your Krishik verification code is: ${code}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith('+') ? phone : `+91${phone}`
      });
      console.log(`SMS sent successfully to ${phone}`);
      res.json({ message: 'Verification code sent' });
    } catch (err) {
      console.error('Failed to send SMS:', err.message);
      res.status(500).json({ message: 'Failed to send code', error: err.message });
    }
  } else {
    console.warn('Twilio not configured. SMS not sent to:', phone);
    res.status(503).json({ message: 'SMS service not available. Please contact support.' });
  }
});

// Verify phone code
router.post('/verify-phone-code', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ message: 'Phone and code are required' });
  if (phoneVerifications[phone] === code) {
    delete phoneVerifications[phone];
    return res.json({ success: true });
  }
  res.status(400).json({ success: false, message: 'Invalid code' });
});

// Store for password reset OTPs
const passwordResetOTPs = {};

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  const now = new Date();
  Object.keys(passwordResetOTPs).forEach(userId => {
    if (passwordResetOTPs[userId].expiresAt < now) {
      delete passwordResetOTPs[userId];
    }
  });
}, 5 * 60 * 1000); // 5 minutes

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password reset OTP to email and phone
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *                 description: Email address or phone number
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 */
// Forgot password - send OTP to email and phone
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    
    // Input validation
    if (!emailOrPhone || emailOrPhone.trim().length === 0) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }
    
    // Sanitize input
    const sanitizedInput = emailOrPhone.trim().toLowerCase();

    // Find user by email or phone
    let user;
    if (sanitizedInput.includes('@')) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedInput)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
      }
      user = await User.findOne({ email: sanitizedInput });
    } else {
      // Phone validation and cleaning
      const cleanPhone = sanitizedInput.replace(/[\s\-\(\)]/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        return res.status(400).json({ message: 'Please enter a valid phone number' });
      }
      
      const phoneVariations = [
        cleanPhone,
        `+91${cleanPhone}`,
        `91${cleanPhone}`,
        cleanPhone.replace(/^\+91/, ''),
        cleanPhone.replace(/^91/, '')
      ];
      
      user = await User.findOne({ 
        phone: { $in: phoneVariations } 
      });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP with user ID
    passwordResetOTPs[user._id.toString()] = {
      otp,
      expiresAt,
      email: user.email,
      phone: user.phone
    };

    // Send OTP to phone
    if (twilioClient) {
      try {
        await twilioClient.messages.create({
          body: `Your Krishik password reset code is: ${otp}. This code expires in 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: user.phone.startsWith('+') ? user.phone : `+91${user.phone}`
        });
        console.log(`SMS sent successfully to ${user.phone}`);
      } catch (phoneErr) {
        console.error('Failed to send SMS:', phoneErr.message);
      }
    } else {
      console.warn('Twilio not configured. SMS not sent to:', user.phone);
    }

    // Send OTP to email (you can implement email service here)
    // For now, we'll just log it
    console.log(`Password reset OTP for ${user.email}: ${otp}`);

    res.json({ 
      message: 'Password reset code sent to your registered email and phone number',
      userId: user._id // Return user ID for frontend
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with OTP verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid OTP or data
 *       404:
 *         description: User not found
 */
// Reset password with OTP verification
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    
    // Input validation
    if (!userId || !otp || !newPassword) {
      return res.status(400).json({ message: 'User ID, OTP, and new password are required' });
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'OTP must be a 6-digit number' });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    if (newPassword.length > 128) {
      return res.status(400).json({ message: 'Password must be less than 128 characters' });
    }
    
    // Check for common weak passwords
    const weakPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
    if (weakPasswords.includes(newPassword.toLowerCase())) {
      return res.status(400).json({ message: 'Password is too weak. Please choose a stronger password.' });
    }

    // Check if OTP exists and is valid
    const storedOTP = passwordResetOTPs[userId];
    if (!storedOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > storedOTP.expiresAt) {
      delete passwordResetOTPs[userId];
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Find user and update password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and reset password change date
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      passwordChangedAt: new Date()
    });

    // Remove OTP from storage
    delete passwordResetOTPs[userId];

    res.json({ message: 'Password reset successfully' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
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