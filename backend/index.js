import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import productsRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import ordersRoutes from './routes/orders.js';
import startupsRoutes from './routes/startups.js';
import { generalLimiter } from './routes/auth.js';
import winston from 'winston';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import multer from 'multer';

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'secret') {
  console.error('FATAL: JWT_SECRET environment variable must be set to a strong value.');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// Winston logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'backend.log' })
  ]
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); 
 
app.use('/api/auth', authRoutes);
app.use('/api', generalLimiter); // Apply to all /api/* except /api/auth
app.use('/api/orders', ordersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/startups', startupsRoutes);

// Swagger setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Krishik Agri API',
    version: '1.0.0',
    description: 'API documentation for Krishik Agri e-commerce backend',
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Local server' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};
const swaggerOptions = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // Path to the API docs
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Centralized error handler
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err && err.stack ? err.stack : JSON.stringify(err)}`);
  res.status(err.status || 500).json({ message: 'Internal server error', error: err && err.message ? err.message : JSON.stringify(err) });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/krishik-agri';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info('MongoDB connected successfully');
    app.listen(PORT, () => {
      logger.info(`🚀 Backend server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => logger.error('MongoDB connection error:', err));

export default app; 