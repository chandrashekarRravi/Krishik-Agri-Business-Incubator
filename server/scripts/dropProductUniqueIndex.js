// Script to drop the unique index on the products collection
// Run this after removing the unique index from the Product schema

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = 'mongodb://localhost:27017/krishik-agri'; // use your real db name

async function dropUniqueIndex() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const collection = mongoose.connection.collection('products');
    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    // Find the unique index name
    const uniqueIndex = indexes.find(idx => idx.unique && idx.key && idx.key.name && idx.key.startup);
    if (uniqueIndex) {
      await collection.dropIndex(uniqueIndex.name);
      console.log('Dropped index:', uniqueIndex.name);
    } else {
      console.log('No matching unique index found.');
    }
    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Error dropping index:', err);
    process.exit(1);
  }
}

dropUniqueIndex(); 