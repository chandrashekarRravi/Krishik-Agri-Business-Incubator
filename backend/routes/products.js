import express from 'express';
import Product from '../models/Product.js';
import multer from 'multer';
import xlsx from 'xlsx';
import mammoth from 'mammoth';
import jwt from 'jsonwebtoken';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

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

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Products fetch error:', err);
    // Return empty array if database is not connected
    res.json([]);
  }
});

// Get all unique categories
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
      category: 'Product category (e.g., Fertilizers, Seeds, Equipment)',
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
// Create product (admin only, with image upload)
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    // Validate image min size (e.g., 10KB)
    if (req.file && req.file.size < 10 * 1024) {
      return res.status(400).json({ message: 'Image too small (min 10KB)' });
    }
    const productData = req.body;
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }
    if (productData.contact) {
      try { productData.contact = JSON.parse(productData.contact); } catch {}
    }
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
});

// Update product (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
});

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

// Bulk upload products (admin only) - supports Excel and DOC files
router.post('/bulk-upload', adminAuth, upload.single('file'), async (req, res) => {
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