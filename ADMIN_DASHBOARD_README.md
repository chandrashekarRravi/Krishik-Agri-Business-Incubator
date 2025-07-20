# Admin Dashboard - Krishik Agri Business Hub

## Overview

The Admin Dashboard is a comprehensive management interface for the Krishik Agri Business Hub platform. It provides administrators with full control over products, users, and orders with advanced features like bulk upload, real-time status updates, and secure authentication.

## Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with admin role verification
- **Secure access control** - only admin users can access the dashboard
- **Automatic redirect** for non-admin users
- **Token-based API requests** with proper authorization headers

### 📦 Product Management
- **View all products** in a responsive table format
- **Add single products** with comprehensive form including:
  - Product details (name, description, price, quantity)
  - Category selection with option to add new categories
  - Startup selection with option to add new startups
  - Contact information (name, phone, email)
  - Image upload with size validation (minimum 10KB)
- **Delete products** with confirmation dialogs
- **Bulk upload** via Excel files (.xlsx, .xls) and Word documents (.docx, .doc)
- **Comprehensive format notice** with MongoDB schema, field descriptions, and examples
- **Dynamic dropdowns** populated from database
- **Real-time updates** after operations

### 👥 User Management
- **View all registered users** with their details
- **Delete users** with confirmation dialogs
- **User count display** in tab navigation
- **Secure user data handling**

### 📋 Order Management
- **View all orders** across all users
- **Update order status** with predefined options:
  - Pending
  - Processing
  - Shipped
  - Delivered
  - Cancelled
- **Delete orders** with confirmation dialogs
- **Order count display** in tab navigation
- **Status badges** with color coding
- **Order details** including order number, product, user, and status

### 🎨 User Interface
- **Modern, responsive design** with Tailwind CSS
- **Card-based layout** for better organization
- **Loading states** with spinners
- **Toast notifications** for success/error feedback
- **Confirmation dialogs** for destructive actions
- **Modal forms** for adding products
- **Status badges** with appropriate colors
- **Hover effects** and smooth transitions

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Install dependencies for bulk upload functionality
npm install xlsx mammoth

# Create admin user and test data
node scripts/testAdminDashboard.js

# Create sample files for bulk upload testing
node scripts/createSampleExcel.js
node scripts/createSampleDoc.js

# Start the backend server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies (if not already done)
npm install

# Start the frontend development server
npm run dev
```

### 3. Database Setup

Ensure your MongoDB connection is properly configured in the `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Admin Credentials

After running the test setup script, you can login with:

- **Email:** admin@krishik.com
- **Password:** admin123

## Usage Guide

### Accessing the Dashboard

1. **Login** with admin credentials
2. **Click on your avatar** in the top-right corner
3. **Select "Admin Dashboard"** from the dropdown menu
4. **Navigate between tabs** to manage different entities

### Adding Products

#### Single Product
1. Go to **Products** tab
2. Click **"Add Product"** button
3. Fill in the form:
   - Product name and description
   - Select category from dropdown or add new one
   - Select startup from dropdown or add new one
   - Enter quantity and price
   - Add contact information
   - Upload product image (minimum 10KB)
4. Click **"Add Product"** to save

#### Bulk Upload
1. Go to **Products** tab
2. Click **"Bulk Upload (Excel/DOC)"** button
3. Review the comprehensive format notice including:
   - MongoDB schema structure
   - Required and optional fields
   - Field descriptions and examples
   - Important notes and limitations
4. Select an Excel file (.xlsx, .xls) or Word document (.docx, .doc)
5. The system will automatically import all products
6. Check the toast notification for import results

### Managing Orders

1. Go to **Orders** tab
2. View all orders with their current status
3. **Update Status:**
   - Click **"Update Status"** button
   - Select new status from dropdown
   - Click **"Update"** to save changes
4. **Delete Order:**
   - Click **"Delete"** button
   - Confirm deletion in dialog

### Managing Users

1. Go to **Users** tab
2. View all registered users
3. **Delete User:**
   - Click **"Delete"** button
   - Confirm deletion in dialog

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `GET /api/products/categories` - Get all categories
- `GET /api/products/startups` - Get all startups
- `GET /api/products/schema-format` - Get product schema format (admin only)
- `POST /api/products/bulk-upload` - Bulk upload products (admin only, supports Excel and DOC)

### Users
- `GET /api/auth` - Get all users (admin only)
- `DELETE /api/auth/:id` - Delete user (admin only)

### Orders
- `GET /api/orders?userId=all` - Get all orders (admin only)
- `PATCH /api/orders/:id/status` - Update order status (admin only)
- `DELETE /api/orders/:id` - Delete order (admin only)

## Security Features

- **JWT Authentication** with admin role verification
- **Authorization middleware** on all admin routes
- **Input validation** for all forms
- **File size validation** for image uploads
- **CSRF protection** through proper headers
- **Secure file upload** handling

## Error Handling

- **Comprehensive error messages** displayed to users
- **Toast notifications** for immediate feedback
- **Loading states** during API calls
- **Graceful fallbacks** for failed operations
- **Network error handling** with retry options

## Testing

### Manual Testing Checklist

- [ ] **Authentication**
  - [ ] Login with admin credentials
  - [ ] Access admin dashboard
  - [ ] Verify non-admin users are redirected
  - [ ] Test logout functionality

- [ ] **Product Management**
  - [ ] View all products
  - [ ] Add single product with all fields
  - [ ] Add new category and startup
  - [ ] Upload product image
  - [ ] Delete product with confirmation
  - [ ] Bulk upload with Excel file

- [ ] **User Management**
  - [ ] View all users
  - [ ] Delete user with confirmation

- [ ] **Order Management**
  - [ ] View all orders
  - [ ] Update order status
  - [ ] Delete order with confirmation

- [ ] **UI/UX**
  - [ ] Responsive design on different screen sizes
  - [ ] Loading states work correctly
  - [ ] Toast notifications appear
  - [ ] Confirmation dialogs work
  - [ ] Form validation works

### Automated Testing

Run the test setup script to verify functionality:

```bash
cd backend
node scripts/testAdminDashboard.js
```

## Troubleshooting

### Common Issues

1. **"You are not authorized" error**
   - Ensure you're logged in as an admin user
   - Check if the user has `isAdmin: true` in the database
   - Verify JWT token is valid

2. **Bulk upload fails**
   - Check file format (.xlsx, .xls, .docx, or .doc)
   - Ensure column headers match expected format
   - For DOC files, use tab-separated values
   - Verify file is not corrupted

3. **Image upload fails**
   - Ensure image is at least 10KB
   - Check file format (jpg, png, etc.)
   - Verify uploads directory exists

4. **Database connection issues**
   - Check MongoDB connection string
   - Ensure database is running
   - Verify network connectivity

### Debug Mode

Enable debug logging by setting environment variables:

```env
DEBUG=true
NODE_ENV=development
```

## Contributing

When contributing to the admin dashboard:

1. **Follow the existing code style**
2. **Add proper TypeScript types**
3. **Include error handling**
4. **Test all functionality**
5. **Update documentation**

## Support

For technical support or questions about the admin dashboard:

1. Check the troubleshooting section
2. Review the API documentation
3. Test with the provided sample data
4. Contact the development team

---

**Last Updated:** December 2024
**Version:** 1.0.0 