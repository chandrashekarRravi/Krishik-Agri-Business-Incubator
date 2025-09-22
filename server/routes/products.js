import express from 'express';
import Product from '../models/Product.js';
import multer from 'multer';
import xlsx from 'xlsx';
import mammoth from 'mammoth';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import { getAllFocusAreaDetails, categoryIcons } from '../utils/categoryMapping.js';
const router = express.Router();
// Cloudinary config


dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
 

const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'krishik-products',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});
const productUpload = multer({
  storage: productStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

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
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
// Get all products (with pagination and filtering)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query object
    const query = {};
    if (req.query.startup) {
      // Log the value being searched
      console.log('Searching for startup:', req.query.startup);
      // Case-insensitive, partial match
      query.startup = { $regex: req.query.startup, $options: 'i' };
    }
    // Add more filters as needed (e.g., category, name, etc.)

    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit),
      Product.countDocuments(query)
    ]);
    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Products fetch error:', err);
    res.json({ products: [], total: 0, page: 1, totalPages: 1 });
  }
});

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get all unique product focus areas
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of focus areas
 */
// Get all unique focus areas
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.filter(Boolean));
  } catch (err) {
    console.error('Categories fetch error:', err);
    // Return empty array if database is not connected
    res.json([]);
  }
});

/**
 * @swagger
 * /api/products/startups:
 *   get:
 *     summary: Get all unique startups
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of startups
 */
// Get all unique startups
router.get('/startups', async (req, res) => {
  try {
    const startups = await Product.distinct('startup');
    res.json(startups.filter(Boolean));
  } catch (err) {
    console.error('Startups fetch error:', err);
    // Return empty array if database is not connected
    res.json([]);
  }
});

/**
 * @swagger
 * /api/products/focus-areas:
 *   get:
 *     summary: Get all focus areas with icons
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of focus areas
 */
// Get all focus areas
router.get('/focus-areas', async (req, res) => {
  try {
    const focusAreaDetails = getAllFocusAreaDetails();
    const focusAreas = Object.entries(focusAreaDetails).map(([id, details]) => ({
      id,
      ...details
    }));
    res.json(focusAreas);
  } catch (err) {
    console.error('Focus areas fetch error:', err);
    res.json([]);
  }
});

/**
 * @swagger
 * /api/products/category-icons:
 *   get:
 *     summary: Get all category icons
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of category icons
 */
// Get all category icons
router.get('/category-icons', async (req, res) => {
  try {
    res.json(categoryIcons);
  } catch (err) {
    console.error('Category icons fetch error:', err);
    res.json({});
  }
});

/**
 * @swagger
 * /api/products/schema-format:
 *   get:
 *     summary: Get product schema format for bulk upload
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Schema format
 */
// Get product schema format (public - no auth required)
router.get('/schema-format', (req, res) => {
  const schemaFormat = {
    message: 'Product Schema Format for DOC/Excel Upload',
    requiredFields: [
      'name (required)',
      'description',
      'category',
      'startup',
      'quantity',
      'price',
      'contact.name',
      'contact.phone',
      'contact.email'
    ],
    optionalFields: [
      'image (URL only - images cannot be uploaded via bulk upload)'
    ],
    mongodbSchema: {
      name: 'String (required)',
      description: 'String',
      category: 'String',
      startup: 'String',
      quantity: 'String',
      price: 'String',
      contact: {
        name: 'String',
        phone: 'String',
        email: 'String'
      },
      image: 'String (URL only)',
      reviews: 'Array (auto-generated)',
      createdAt: 'Date (auto-generated)',
      updatedAt: 'Date (auto-generated)'
    },
    format: {
      excel: 'Use Excel with columns matching the field names above',
      doc: 'Use Word document with table format matching the field names above',
      example: {
        name: 'Organic Fertilizer',
        description: 'High-quality organic fertilizer',
        category: 'Fertilizers',
        startup: 'GreenTech Solutions',
        quantity: '100',
        price: '500',
        'contact.name': 'John Doe',
        'contact.phone': '9876543210',
        'contact.email': 'john@greentech.com'
      }
    },
    fieldDescriptions: {
      name: 'Product name - this field is mandatory',
      description: 'Detailed product description',
      category: 'Product focus area (e.g., Fertilizers, Seeds, Equipment)',
      startup: 'Name of the startup company offering the product',
      quantity: 'Available quantity (can be number or text)',
      price: 'Product price (can be number or text)',
      'contact.name': 'Contact person name for this product',
      'contact.phone': 'Contact phone number',
      'contact.email': 'Contact email address',
      image: 'Product image URL (not file upload)'
    }
  };
  res.json(schemaFormat);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
// Get one product (must be after specific routes)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               startup:
 *                 type: string
 *               quantity:
 *                 type: string
 *               price:
 *                 type: string
 *               contact:
 *                 type: string
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
// Create product (admin only, with multiple image upload)
router.post('/', adminAuth, productUpload.array('image', 5), async (req, res) => {
  console.log('Received POST /api/products', req.body, req.files); // Log request data
  try {
    const productData = req.body;
    if (req.files && req.files.length > 0) {
      productData.image = req.files.map(f => f.path);
    } else if (req.body.image) {
      productData.image = Array.isArray(req.body.image) ? req.body.image : [req.body.image];
    }
    if (productData.contact) {
      try { productData.contact = JSON.parse(productData.contact); } catch {}
    }
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    // Enhanced error logging for debugging
    console.error('Product upload error:', err);
    if (err && typeof err === 'object') {
      Object.getOwnPropertyNames(err).forEach(key => {
        console.error(`err[${key}]:`, err[key]);
      });
    }
    try {
      console.error('Stringified error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    } catch (e) {
      console.error('Error stringifying error:', e);
    }
    res.status(500).json({ message: 'Server error', error: err.message || err });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               startup:
 *                 type: string
 *               quantity:
 *                 type: string
 *               price:
 *                 type: string
 *               contact:
 *                 type: string
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
// Update product (admin only, with multiple image upload)
router.put('/:id', adminAuth, productUpload.array('image', 5), async (req, res) => {
  try {
    const updateData = req.body;
    if (req.files && req.files.length > 0) {
      updateData.image = req.files.map(f => f.path);
    } else if (req.body.image) {
      updateData.image = Array.isArray(req.body.image) ? req.body.image : [req.body.image];
    }
    if (updateData.contact) {
      try { updateData.contact = JSON.parse(updateData.contact); } catch {}
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Product deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
// Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/products/{productId}/reviews:
 *   post:
 *     summary: Add a review to a product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               name:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review added
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 */
// Add a review to a product
router.post('/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, name, rating, comment } = req.body;
    if (!userId || !name || !rating) return res.status(400).json({ message: 'userId, name, and rating are required' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.reviews.push({ user: userId, name, rating, comment });
    await product.save();
    res.json(product.reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add review', error: err.message });
  }
});
/**
 * @swagger
 * /api/products/{productId}/reviews:
 *   get:
 *     summary: Get reviews for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of reviews
 *       404:
 *         description: Product not found
 */
// Get reviews for a product
router.get('/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product.reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
});

/**
 * @swagger
 * /api/products/bulk-upload:
 *   post:
 *     summary: Bulk upload products (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Products uploaded successfully
 *       400:
 *         description: Invalid file or data
 *       401:
 *         description: Unauthorized
 */
// Bulk upload products (admin only) - supports Excel and DOC files
router.post('/bulk-upload', adminAuth, productUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    let products = [];
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Parse Excel file
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      products = xlsx.utils.sheet_to_json(sheet);
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      // Parse DOC file
      const result = await mammoth.extractRawText({ path: req.file.path });
      const text = result.value;
      
      // Parse the text to extract table data
      // This is a simple parser - you might want to enhance it based on your DOC format
      const lines = text.split('\n').filter(line => line.trim());
      const headers = [];
      const data = [];
      
      // Extract headers from first line
      if (lines.length > 0) {
        headers.push(...lines[0].split('\t').map(h => h.trim()));
      }
      
      // Extract data from remaining lines
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t').map(v => v.trim());
        if (values.length === headers.length) {
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          data.push(row);
        }
      }
      
      products = data;
    } else {
      return res.status(400).json({ 
        message: 'Unsupported file format. Please upload .xlsx, .xls, .docx, or .doc files' 
      });
    }
    
    // Validate and process products
    const validProducts = products.map(product => {
      // Handle contact object if it's in flat format
      const processedProduct = { ...product };
      if (product['contact.name'] || product['contact.phone'] || product['contact.email']) {
        processedProduct.contact = {
          name: product['contact.name'] || '',
          phone: product['contact.phone'] || '',
          email: product['contact.email'] || ''
        };
        delete processedProduct['contact.name'];
        delete processedProduct['contact.phone'];
        delete processedProduct['contact.email'];
      }
      return processedProduct;
    }).filter(product => product.name); // Only include products with names

    // ENFORCE IMAGE FIELD IS REQUIRED
    const missingImage = validProducts.find(product => !product.image || typeof product.image !== 'string' || !product.image.trim());
    if (missingImage) {
      return res.status(400).json({ message: 'Each product must have a non-empty image URL.' });
    }
    
    if (validProducts.length === 0) {
      return res.status(400).json({ message: 'No valid products found in file' });
    }
    
    // Insert products in bulk
    const result = await Product.insertMany(validProducts);
    res.status(201).json({ 
      message: 'Products uploaded successfully', 
      count: result.length,
      fileType: fileExtension.toUpperCase()
    });
  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ message: 'Bulk upload failed', error: err.message });
  }
});

export default router; 