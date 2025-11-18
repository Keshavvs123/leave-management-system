const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/admin-auth');
const leavesRoutes = require('./routes/leaves');
const employeesRoutes = require('./routes/employees');
const usersRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     ✅ SERVER STARTED SUCCESSFULLY     ║');
  console.log('╚════════════════════════════════════════╝\n');
  console.log(`🚀 Backend URL: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('\n⚠️  DO NOT CLOSE THIS TERMINAL!\n');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('Try: lsof -i :5000 (Mac/Linux) or netstat -ano | findstr :5000 (Windows)');
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});
