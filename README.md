# Krishik Agri Business Hub

A full-stack platform for managing agricultural products, startups, and orders, with real-world notification and admin features.

## Features

- **Product & Startup Management:**
  - Add, edit, delete, and filter products and startups via the Admin Dashboard.
  - Prevent duplicate startups and products (strict checks on name, contact, etc.).
- **Order Placement:**
  - Users can place orders for products.
  - Orders are saved in MongoDB.
- **Notifications:**
  - **User:** Receives a confirmation email on order.
  - **Startup:** Receives an email and SMS (via Twilio) with order and customer details.
  - **Admin:** Sees real-time notifications in the dashboard (bell icon) for every order.
- **Production-Ready:**
  - All secrets and credentials are managed via environment variables.
  - Robust error handling: orders are always saved, even if notifications fail.
  - Logging for all notification events and errors.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Notifications:** Nodemailer (Gmail), Twilio (SMS)

## Setup Instructions

### 1. Clone the Repository
```sh
git clone <repo-url>
cd krishik-agri
```

### 2. Install Dependencies
#### Backend
```sh
cd backend
npm install
```
#### Frontend
```sh
cd ../
npm install
```

### 3. Environment Variables
Create a `.env` file in `backend/` with the following:
```env
MONGODB_URI=mongodb://localhost:27017/krishik-agri
JWT_SECRET=your_jwt_secret
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_gmail_app_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 4. Start MongoDB
Make sure MongoDB is running locally or update the URI for your cloud instance.

### 5. Start the Backend
```sh
cd backend
npm start
```

### 6. Start the Frontend
```sh
npm run dev
```

### 7. Admin User Setup
- Use the provided script or manually set `isAdmin: true` for your user in the database.
- Only admin users can access the dashboard and notifications.

## Usage
- **Admin Dashboard:** Manage products, startups, orders, and view notifications.
- **Order Flow:**
  1. User places an order.
  2. User receives confirmation email.
  3. Startup receives order email and SMS.
  4. Admin sees a notification in the dashboard.

## Troubleshooting
- **500/403 Errors:** Ensure backend is running, `.env` is set, and you are logged in as admin.
- **No Startup Notification:** Ensure product's `startup` field matches Startup's `name` exactly (case-insensitive, trimmed).
- **Twilio/Gmail Issues:** Double-check credentials and phone/email formats.

## Contributing
Pull requests welcome! Please open an issue first to discuss major changes.

## License
[MIT](LICENSE)
