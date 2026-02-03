const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors'); // Optional usually, but helps debugging
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const categories = require('./routes/categoryRoutes');
const notes = require('./routes/noteRoutes');

const app = express();

// Request Logger
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} Origin: ${req.headers.origin}`);
  next();
});

const cors = require('cors');

// Permissive CORS for debugging
const params = {
  origin: true, // Reflects the request origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(params));
app.options('*', cors(params));

// Health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Prevent XSS attacks
app.use(xss());

// Prevent http param pollution
app.use(hpp());

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/categories', categories);
app.use('/api/v1/notes', notes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Do not close server on Render, keep it alive
  // server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  // Keep alive
});
