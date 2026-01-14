const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const http = require('http');
const socketIo = require('socket.io');
const db = require('./config/database');
require('dotenv').config();

const serviceRoutes = require('./routes/serviceRoutes');
const barberRoutes = require('./routes/barberRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/authRoutes');
const customerAuthRoutes = require('./routes/customerAuthRoutes');
const statisticRoutes = require('./routes/statisticRoutes');
const barberManagementRoutes = require('./routes/barberManagementRoutes');
const serviceManagementRoutes = require('./routes/serviceManagementRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const { requireAuth } = require('./middleware/authMiddleware');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: true,
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 86400000, // 24 hours
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, db.pool);

app.use(session({
  key: 'pangkashub_session',
  secret: process.env.SESSION_SECRET || 'pangkashub-secret-key-change-in-production',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer-auth', customerAuthRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/statistics', statisticRoutes);
app.use('/api/manage-barbers', barberManagementRoutes);
app.use('/api/manage-services', serviceManagementRoutes);
app.use('/api/reviews', reviewRoutes);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/customer-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customer-login.html'));
});

app.get('/my-bookings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'my-bookings.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin/all-bookings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'all-bookings.html'));
});

app.get('/admin/manage-barbers', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manage-barbers.html'));
});

app.get('/admin/manage-services', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manage-services.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Admin connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Admin disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
