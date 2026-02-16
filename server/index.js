const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const notificationService = require('./services/notificationService'); // Import Notification Service

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const categories = require('./routes/categoryRoutes');
const notes = require('./routes/noteRoutes');
const notifications = require('./routes/notificationRoutes');
const chat = require('./routes/chatRoutes');
const system = require('./routes/systemRoutes');
const folders = require('./routes/folderRoutes');

const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize Notification Service with IO
notificationService.setIO(io);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinPrivate', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their private room`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { sender, recipient, message, attachment } = data;
      const Chat = require('./models/Chat');

      const chatData = {
        sender,
        recipient: recipient || null,
        message: message || ""
      };

      if (attachment && attachment.url) {
        chatData.attachment = {
          url: attachment.url,
          name: attachment.name,
          fileType: attachment.fileType || attachment.type || 'file'
        };
      }

      // Check if recipient is online to set initial status
      // For simplicity, we'll mark as 'sent' first, then let the recipient confirm delivery
      const newChat = await Chat.create(chatData);
      const populatedChat = await Chat.findById(newChat._id)
        .populate('sender', 'username avatar')
        .lean();

      if (recipient) {
        // Broadcast to recipient
        io.to(recipient).emit('privateMessage', populatedChat);
        // Also send back to sender so they have the DB version with ID and status
        socket.emit('privateMessage', populatedChat);

        // Notify recipient (Notification system)
        // Notify recipient (Notification system)
        await notificationService.sendNotification({
          recipient,
          sender,
          type: 'comment',
          message: `New message from ${populatedChat.sender.username}`,
          link: `/chat?user=${sender}`
        });
      } else {
        io.emit('message', populatedChat);
      }
    } catch (err) {
      console.error('Socket error:', err);
    }
  });

  // Handle Double Tick (Delivered)
  socket.on('messageDelivered', async ({ messageId, senderId }) => {
    try {
      const Chat = require('./models/Chat');
      const chat = await Chat.findByIdAndUpdate(messageId, { status: 'delivered' }, { new: true });
      if (chat) {
        io.to(senderId).emit('statusUpdate', { messageId, status: 'delivered' });
      }
    } catch (err) {
      console.error('Delivery update error:', err);
    }
  });

  // Handle Blue Tick (Read)
  socket.on('markAsRead', async ({ recipientId, senderId }) => {
    try {
      const Chat = require('./models/Chat');
      // Update all messages from sender to recipient as read
      await Chat.updateMany(
        { sender: senderId, recipient: recipientId, status: { $ne: 'read' } },
        { status: 'read' }
      );
      io.to(senderId).emit('messagesRead', { recipientId });
    } catch (err) {
      console.error('Read update error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});



// MANUAL CORS MIDDLEWARE - The Nuclear Option
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow any origin that comes in (Reflect Origin)
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback for non-browser tools
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');

  console.log(`🛡️ CORS: ${req.method} ${req.path} | Origin: ${origin || 'None'}`);

  // Handle Preflight directly
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});



// Trust proxy
app.set('trust proxy', 1);

// Compression
app.use(compression());

// Rate Limiting (Increased for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 200 : 20,
  message: 'Too many auth attempts.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// CORS removed from here and moved to top

// Body parser
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Static folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security
app.use(mongoSanitize());
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Disable CSP to prevent CORS blocking
}));
app.use(xss());
app.use(hpp());

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to ScriptShelf API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/categories', categories);
app.use('/api/v1/notes', notes);
app.use('/api/v1/notifications', notifications);
app.use('/api/v1/chat', chat);
app.use('/api/v1/system', system);
app.use('/api/v1/folders', folders);

// Error middleare

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});
