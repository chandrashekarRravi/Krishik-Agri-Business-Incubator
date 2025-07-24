import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/krishik-agri';

async function testAdminDashboard() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Create admin user if not exists
    let adminUser = await User.findOne({ email: 'admin@krishik.com' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = new User({
        name: 'Admin User',
        email: 'admin@krishik.com',
        phone: '1234567890',
        address: 'Admin Address',
        password: hashedPassword,
        isAdmin: true
      });
      await adminUser.save();
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create test products if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const testProducts = [
        {
          name: 'Organic Fertilizer',
          description: 'High-quality organic fertilizer for better crop yield',
          category: 'Fertilizers',
          startup: 'GreenTech Solutions',
          quantity: 100,
          price: 500,
          contact: { name: 'John Doe', phone: '9876543210', email: 'john@greentech.com' }
        },
        {
          name: 'Smart Irrigation System',
          description: 'Automated irrigation system with sensors',
          category: 'Irrigation',
          startup: 'AgriTech Innovations',
          quantity: 50,
          price: 2500,
          contact: { name: 'Jane Smith', phone: '9876543211', email: 'jane@agritech.com' }
        },
        {
          name: 'Seed Variety Pack',
          description: 'Mixed variety of high-yield seeds',
          category: 'Seeds',
          startup: 'SeedCorp',
          quantity: 200,
          price: 300,
          contact: { name: 'Mike Johnson', phone: '9876543212', email: 'mike@seedcorp.com' }
        }
      ];

      await Product.insertMany(testProducts);
      console.log('✅ Test products created');
    } else {
      console.log('✅ Products already exist');
    }

    // Create test orders if none exist
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      const testOrders = [
        {
          user: adminUser._id,
          productName: 'Organic Fertilizer',
          orderNumber: 'KRISHIK-1703123456789-123',
          quantity: 2,
          total: 1000,
          status: 'pending',
          shippingAddress: 'Test Address 1',
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        },
        {
          user: adminUser._id,
          productName: 'Smart Irrigation System',
          orderNumber: 'KRISHIK-1703123456790-456',
          quantity: 1,
          total: 2500,
          status: 'processing',
          shippingAddress: 'Test Address 2',
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        }
      ];

      await Order.insertMany(testOrders);
      console.log('✅ Test orders created');
    } else {
      console.log('✅ Orders already exist');
    }

    // Display summary
    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();

    console.log('\n📊 Database Summary:');
    console.log(`Users: ${users}`);
    console.log(`Products: ${products}`);
    console.log(`Orders: ${orders}`);

    console.log('\n🔑 Admin Login Credentials:');
    console.log('Email: admin@krishik.com');
    console.log('Password: admin123');

    console.log('\n🌐 Access Admin Dashboard:');
    console.log('1. Start the backend server: npm run dev (in backend folder)');
    console.log('2. Start the frontend server: npm run dev (in root folder)');
    console.log('3. Login with admin credentials');
    console.log('4. Click on Admin Dashboard in the user menu');
    console.log('5. Test all features: CRUD operations, bulk upload, etc.');
    
    console.log('\n📁 Create sample files for testing:');
    console.log('node scripts/createSampleExcel.js  # Creates Excel sample');
    console.log('node scripts/createSampleDoc.js     # Creates DOC/TXT samples');

    await mongoose.disconnect();
    console.log('\n✅ Test setup completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAdminDashboard(); 