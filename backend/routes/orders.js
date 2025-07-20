import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import jwt from 'jsonwebtoken';
dotenv.config();

const router = express.Router();

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
    // Send confirmation email (existing logic)
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
    res.status(200).json({ message: 'Order placed and confirmation email sent.' });
  } catch (err) {
    console.error('Order placement error:', err); // Log the full error
    res.status(500).json({ message: 'Order placed but failed to send email.', error: err.message });
  }
});

// Get order history for a user or all orders if userId=all
router.get('/', async (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /api/orders`, req.query);
  try {
    const { userId } = req.query;
    let orders;
    if (userId === 'all') {
      orders = await Order.find().populate('product').sort({ createdAt: -1 });
      console.log(`[${new Date().toISOString()}] Returned all orders (${orders.length})`);
    } else if (userId) {
      orders = await Order.find({ user: userId }).populate('product').sort({ createdAt: -1 });
      console.log(`[${new Date().toISOString()}] Returned orders for user ${userId} (${orders.length})`);
    } else {
      console.warn(`[${new Date().toISOString()}] userId is required for /api/orders`);
      return res.status(400).json({ message: 'userId is required' });
    }
    res.json(orders);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error in GET /api/orders:`, err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

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

export default router; 