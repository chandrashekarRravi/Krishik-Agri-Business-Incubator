import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import jwt from 'jsonwebtoken';
import Startup from '../models/Startup.js';
import Notification from '../models/Notification.js';
import twilio from 'twilio';
dotenv.config();

const router = express.Router();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Admin auth middleware
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

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Place a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               total:
 *                 type: number
 *               shippingAddress:
 *                 type: string
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               productName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order placed and confirmation email sent
 *       400:
 *         description: Validation error
 */
// Place order and send confirmation email
router.post('/', async (req, res) => {
  try {
    const { userId, productId, quantity, total, shippingAddress, email, name, product, productName, ...rest } = req.body;
    
    // Generate unique order number
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const orderNumber = `KRISHIK-${timestamp}-${randomNum}`;
    // Calculate estimated delivery (5 days from now)
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    // Create order with product name, order number, and estimated delivery
    const order = new Order({
      user: userId,
      product: null, // Set to null for now since we're using static data
      productName: productName,
      orderNumber: orderNumber,
      quantity,
      total,
      shippingAddress,
      estimatedDelivery
    });
    await order.save();
    // Send confirmation email to user (existing logic)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Order Confirmation - Krishik Agri Business Hub',
      html: `<h2>Thank you for your order, ${name}!</h2>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p>Your order for <b>${productName}</b> (Quantity: ${quantity}) has been received.</p>
        <p>Total Amount: <b>₹${total}</b></p>
        <p>We will process your order soon.</p>
        <p>Please keep this order number for tracking your order.</p>`
    };
    await transporter.sendMail(mailOptions);

    // --- NEW: Notify Startup with detailed logging ---
    console.log('productId:', productId, 'productName:', productName);
    let productDoc = null;
    let startupDoc = null;
    if (productId) {
      productDoc = await Product.findById(productId);
      console.log('productDoc:', productDoc);
      if (productDoc) {
        startupDoc = await Startup.findOne({ name: productDoc.startup });
      }
    } else if (productName) {
      productDoc = await Product.findOne({ name: productName });
      console.log('productDoc:', productDoc);
      if (productDoc) {
        startupDoc = await Startup.findOne({ name: productDoc.startup });
      }
    }
    console.log('startupDoc:', startupDoc);
    if (startupDoc) {
      console.log('Startup contact email:', startupDoc.contact.email);
      console.log('Startup contact phone:', startupDoc.contact.phone);
      // Send email to startup
      const startupMailOptions = {
        from: process.env.GMAIL_USER,
        to: startupDoc.contact.email,
        subject: 'New Order Received - Krishik Agri Business Hub',
        html: `<h2>You have received a new order!</h2>
          <p><strong>Product:</strong> ${productName}</p>
          <p><strong>Quantity:</strong> ${quantity}</p>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Customer Name:</strong> ${name}</p>
          <p><strong>Customer Phone:</strong> ${rest.phone || ''}</p>
          <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
          <p><strong>Total Amount:</strong> ₹${total}</p>
          <p>Please process this order promptly.</p>`
      };
      try {
        await transporter.sendMail(startupMailOptions);
        console.log('Startup email sent to:', startupDoc.contact.email);
      } catch (emailErr) {
        console.error('Failed to send startup email:', emailErr);
      }
      // Send SMS to startup
      if (startupDoc.contact.phone) {
        const smsBody = `New order for ${productName} (Qty: ${quantity})\nOrder#: ${orderNumber}\nCustomer: ${name}, ${rest.phone || ''}`;
        try {
          await twilioClient.messages.create({
            body: smsBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: startupDoc.contact.phone.startsWith('+') ? startupDoc.contact.phone : `+91${startupDoc.contact.phone}`
          });
          console.log('Startup SMS sent to:', startupDoc.contact.phone);
        } catch (smsErr) {
          console.error('Failed to send startup SMS:', smsErr);
        }
      }
      // Create admin notification
      try {
        const notification = await Notification.create({
          message: `New order for ${productName} (Qty: ${quantity}) by ${name}. Order#: ${orderNumber}`,
          type: 'order',
          read: false
        });
        console.log('Admin notification created:', notification);
      } catch (notifErr) {
        console.error('Failed to create admin notification:', notifErr);
      }
    } else {
      console.warn('No startup found for product. Startup notification skipped.');
    }
    // --- END NEW ---
    res.status(200).json({ message: 'Order placed and confirmation email sent.' });
  } catch (err) {
    console.error('Order placement error:', err); // Log the full error
    res.status(500).json({ message: 'Order placed but failed to send email.', error: err.message });
  }
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get order history for a user or all orders (admin)
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID or 'all' for all orders
 *     responses:
 *       200:
 *         description: List of orders
 *       400:
 *         description: userId is required
 */
// Get order history for a user or all orders if userId=all (with pagination)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    let orders, total;
    if (userId === 'all') {
      [orders, total] = await Promise.all([
        Order.find().populate('product').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments()
      ]);
    } else if (userId) {
      [orders, total] = await Promise.all([
        Order.find({ user: userId }).populate('product').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments({ user: userId })
      ]);
    } else {
      return res.status(400).json({ message: 'userId is required' });
    }
    res.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get a single order by orderId
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
// Get a single order by orderId
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
});

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   patch:
 *     summary: Update order status (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Status is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
// Update order status (admin/staff)
router.patch('/:orderId/status', adminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status', error: err.message });
  }
});

/**
 * @swagger
 * /api/orders/{orderId}:
 *   delete:
 *     summary: Delete an order (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Order deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
// Delete order (admin only)
router.delete('/:orderId', adminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
});

/**
 * @swagger
 * /api/orders/admin/notifications:
 *   get:
 *     summary: Get all admin notifications (newest first)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       500:
 *         description: Failed to fetch notifications
 */
// Get all admin notifications (newest first)
router.get('/admin/notifications', adminAuth, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
});

export default router; 