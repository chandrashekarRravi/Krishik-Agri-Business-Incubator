import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { mapCategoryToFocusAreas, getPrimaryFocusArea } from '../utils/categoryMapping.js';
import dotenv from 'dotenv';

dotenv.config();

async function updateProductFocusAreas() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/krishik-agri');
    console.log('Connected to MongoDB');

    // First, let's see all products
    const allProducts = await Product.find({});
    console.log(`Total products in database: ${allProducts.length}`);
    
    if (allProducts.length > 0) {
      console.log('Sample product:', JSON.stringify(allProducts[0], null, 2));
    }

    // Find all products to update with new category-specific icons
    const products = await Product.find({});

    console.log(`Found ${products.length} products to update`);

    let updatedCount = 0;

    for (const product of products) {
      if (product.category) {
        const focusAreas = mapCategoryToFocusAreas(product.category);
        const primaryFocusArea = getPrimaryFocusArea(product.category);

        await Product.findByIdAndUpdate(product._id, {
          focusAreas,
          primaryFocusArea
        });

        updatedCount++;
        console.log(`Updated product: ${product.name} (${product.category}) -> ${primaryFocusArea.title} (${primaryFocusArea.icon})`);
      }
    }

    console.log(`Successfully updated ${updatedCount} products with focus area information`);
    
    // Verify the update
    const totalProducts = await Product.countDocuments();
    const productsWithFocusAreas = await Product.countDocuments({
      focusAreas: { $exists: true, $ne: [] },
      primaryFocusArea: { $exists: true }
    });

    console.log(`Total products: ${totalProducts}`);
    console.log(`Products with focus areas: ${productsWithFocusAreas}`);

  } catch (error) {
    console.error('Error updating product focus areas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
updateProductFocusAreas();
