import fs from 'fs';
import path from 'path';

// Sample product data for DOC file
const sampleProducts = [
  {
    name: 'Bio Fertilizer Pack',
    description: 'Organic bio fertilizer for sustainable farming',
    category: 'Fertilizers',
    startup: 'EcoFarm Solutions',
    quantity: '150',
    price: '750',
    'contact.name': 'Sarah Wilson',
    'contact.phone': '9876543213',
    'contact.email': 'sarah@ecofarm.com'
  },
  {
    name: 'Drip Irrigation Kit',
    description: 'Complete drip irrigation system for small farms',
    category: 'Irrigation',
    startup: 'WaterTech',
    quantity: '75',
    price: '1800',
    'contact.name': 'David Brown',
    'contact.phone': '9876543214',
    'contact.email': 'david@watertech.com'
  },
  {
    name: 'Hybrid Corn Seeds',
    description: 'High-yield hybrid corn seeds',
    category: 'Seeds',
    startup: 'SeedMaster',
    quantity: '300',
    price: '400',
    'contact.name': 'Lisa Chen',
    'contact.phone': '9876543215',
    'contact.email': 'lisa@seedmaster.com'
  },
  {
    name: 'Soil Testing Kit',
    description: 'Complete soil testing kit with pH meter',
    category: 'Testing Equipment',
    startup: 'SoilLab',
    quantity: '100',
    price: '1200',
    'contact.name': 'Robert Kumar',
    'contact.phone': '9876543216',
    'contact.email': 'robert@soillab.com'
  },
  {
    name: 'Pesticide Sprayer',
    description: 'Manual pesticide sprayer for small farms',
    category: 'Equipment',
    startup: 'FarmTools',
    quantity: '200',
    price: '350',
    'contact.name': 'Maria Garcia',
    'contact.phone': '9876543217',
    'contact.email': 'maria@farmtools.com'
  }
];

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create DOC file content with tab-separated values
const headers = ['name', 'description', 'category', 'startup', 'quantity', 'price', 'contact.name', 'contact.phone', 'contact.email'];
const headerRow = headers.join('\t');

const dataRows = sampleProducts.map(product => 
  headers.map(header => product[header] || '').join('\t')
);

const docContent = [headerRow, ...dataRows].join('\n');

// Write DOC file (as text file that can be opened in Word)
const filePath = path.join(uploadsDir, 'sample_products.txt');
fs.writeFileSync(filePath, docContent);

// Also create a more detailed DOC format file
const detailedContent = `PRODUCT BULK UPLOAD TEMPLATE

This file contains sample product data in tab-separated format.
Copy this format for your DOC/Excel files.

📋 MONGODB SCHEMA FORMAT:
{
  name: String (required)
  description: String
  category: String
  startup: String
  quantity: String
  price: String
  contact: {
    name: String
    phone: String
    email: String
  }
  image: String (URL only)
  reviews: Array (auto-generated)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}

📊 SAMPLE DATA FORMAT:
${headerRow}
${dataRows.join('\n')}

📖 FIELD DESCRIPTIONS:
- name: Product name (required) - this field is mandatory
- description: Detailed product description
- category: Product category (e.g., Fertilizers, Seeds, Equipment)
- startup: Name of the startup company offering the product
- quantity: Available quantity (can be number or text)
- price: Product price (can be number or text)
- contact.name: Contact person name for this product
- contact.phone: Contact phone number
- contact.email: Contact email address
- image: Product image URL (not file upload)

📋 INSTRUCTIONS:
1. Use tab-separated values (not spaces)
2. Include all column headers in the first row
3. Each product should be on a separate line
4. Required fields: name (all others are optional)
5. Contact fields should be: contact.name, contact.phone, contact.email
6. Save as .doc, .docx, .xls, or .xlsx file
7. Images cannot be uploaded via bulk upload (use image URLs only)
8. Reviews, createdAt, and updatedAt are automatically generated

⚠️ IMPORTANT NOTES:
- Product name is required for all entries
- Contact information should be in the format: contact.name, contact.phone, contact.email
- For DOC files, use table format with tab-separated values
- For Excel files, use column headers matching the field names
`;

const detailedFilePath = path.join(uploadsDir, 'product_upload_template.txt');
fs.writeFileSync(detailedFilePath, detailedContent);

console.log('✅ Sample DOC/TXT files created successfully!');
console.log(`📁 File location: ${filePath}`);
console.log(`📁 Template location: ${detailedFilePath}`);
console.log('\n📋 Instructions for bulk upload:');
console.log('1. Go to Admin Dashboard');
console.log('2. Click "Bulk Upload (Excel/DOC)" button');
console.log('3. Review the format requirements');
console.log('4. Select the sample_products.txt file (or create your own)');
console.log('5. The products will be imported automatically');
console.log('\n📊 Sample data includes:');
console.log('- 5 different products');
console.log('- Various categories: Fertilizers, Irrigation, Seeds, Testing Equipment, Equipment');
console.log('- Different startups and contact information');
console.log('- Realistic pricing and quantities');
console.log('\n💡 Note: You can copy the content from the .txt files and paste into Word/Excel'); 