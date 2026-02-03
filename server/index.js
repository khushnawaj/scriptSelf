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
const cors = require('cors');
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
// Enable CORS immediately
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://script-self-two.vercel.app',
  'https://script-self.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");
    const isAllowed = allowedOrigins.some(o => o === normalizedOrigin);
    const isVercel = /\.vercel\.app$/.test(normalizedOrigin) &&
      (normalizedOrigin.includes('script-self') || normalizedOrigin.includes('scriptself'));
    const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : null;
    const isClient = clientUrl && normalizedOrigin === clientUrl;

    if (isAllowed || isVercel || isClient) {
      callback(null, true);
    } else {
      console.log(`[CORS] Rejected: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
// Enable pre-flight for all routes
app.options('*', cors(corsOptions));

// Body parser
app.use(express.json());

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
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
