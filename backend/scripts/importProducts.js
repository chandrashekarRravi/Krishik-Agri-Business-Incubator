import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';

// Helper to get __dirname in ES modules (cross-platform)
const __filename = new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const __dirname = path.dirname(__filename);

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/krishik-agri';

async function importProducts() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Read products.json and parse product data
    const productsFile = path.resolve(__dirname, '../../src/data/products.json');
    if (!fs.existsSync(productsFile)) {
      throw new Error(`Products file not found at: ${productsFile}`);
    }
    const fileContent = fs.readFileSync(productsFile, 'utf-8');
    const productData = JSON.parse(fileContent);

    // Remove existing products
    await Product.deleteMany({});
    // Remove 'id' field from each product
    const cleanedProductData = productData.map(({ id, ...rest }) => rest);
    // Insert new products
    await Product.insertMany(cleanedProductData);
    console.log('Products imported successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error importing products:', err);
    process.exit(1);
  }
}

importProducts(); 