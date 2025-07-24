import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

// Sample product data for Excel file
const sampleProducts = [
  {
    name: 'Bio Fertilizer Pack',
    description: 'Organic bio fertilizer for sustainable farming',
    category: 'Fertilizers',
    startup: 'EcoFarm Solutions',
    quantity: 150,
    price: 750,
    'contact.name': 'Sarah Wilson',
    'contact.phone': '9876543213',
    'contact.email': 'sarah@ecofarm.com'
  },
  {
    name: 'Drip Irrigation Kit',
    description: 'Complete drip irrigation system for small farms',
    category: 'Irrigation',
    startup: 'WaterTech',
    quantity: 75,
    price: 1800,
    'contact.name': 'David Brown',
    'contact.phone': '9876543214',
    'contact.email': 'david@watertech.com'
  },
  {
    name: 'Hybrid Corn Seeds',
    description: 'High-yield hybrid corn seeds',
    category: 'Seeds',
    startup: 'SeedMaster',
    quantity: 300,
    price: 400,
    'contact.name': 'Lisa Chen',
    'contact.phone': '9876543215',
    'contact.email': 'lisa@seedmaster.com'
  },
  {
    name: 'Soil Testing Kit',
    description: 'Complete soil testing kit with pH meter',
    category: 'Testing Equipment',
    startup: 'SoilLab',
    quantity: 100,
    price: 1200,
    'contact.name': 'Robert Kumar',
    'contact.phone': '9876543216',
    'contact.email': 'robert@soillab.com'
  },
  {
    name: 'Pesticide Sprayer',
    description: 'Manual pesticide sprayer for small farms',
    category: 'Equipment',
    startup: 'FarmTools',
    quantity: 200,
    price: 350,
    'contact.name': 'Maria Garcia',
    'contact.phone': '9876543217',
    'contact.email': 'maria@farmtools.com'
  }
];

// Create workbook and worksheet
const workbook = xlsx.utils.book_new();
const worksheet = xlsx.utils.json_to_sheet(sampleProducts);

// Add worksheet to workbook
xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Write Excel file
const filePath = path.join(uploadsDir, 'sample_products.xlsx');
xlsx.writeFile(workbook, filePath);

console.log('✅ Sample Excel file created successfully!');
console.log(`📁 File location: ${filePath}`);
console.log('\n📋 Instructions for bulk upload:');
console.log('1. Go to Admin Dashboard');
console.log('2. Click "Bulk Upload (Excel)" button');
console.log('3. Select the sample_products.xlsx file');
console.log('4. The products will be imported automatically');
console.log('\n📊 Sample data includes:');
console.log('- 5 different products');
console.log('- Various categories: Fertilizers, Irrigation, Seeds, Testing Equipment, Equipment');
console.log('- Different startups and contact information');
console.log('- Realistic pricing and quantities'); 