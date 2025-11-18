const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = 'your-secret-key-change-in-production';

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, mobile, address } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const connection = await db.getConnection();

    try {
      // Check if user exists
      const [existing] = await connection.query(
        'SELECT * FROM Login WHERE login_username = ?',
        [username]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Insert into Login table
      const [loginResult] = await connection.query(
        'INSERT INTO Login (login_username, login_password) VALUES (?, ?)',
        [username, password]
      );

      // Insert into User table
      const [userResult] = await connection.query(
        'INSERT INTO User (user_name, user_mobile, user_email, user_address, login_id) VALUES (?, ?, ?, ?, ?)',
        [name, mobile, email, address, loginResult.insertId]
      );

      // Insert into Employee table
      await connection.query(
        'INSERT INTO Employee (emp_name, emp_mobile, emp_email, emp_add, user_id) VALUES (?, ?, ?, ?, ?)',
        [name, mobile, email, address, userResult.insertId]
      );

      // Create leave balance
      const [empData] = await connection.query(
        'SELECT emp_id FROM Employee WHERE user_id = ?',
        [userResult.insertId]
      );

      await connection.query(
        'INSERT INTO EmployeeLeaveBalance (emp_id) VALUES (?)',
        [empData[0].emp_id]
      );

      res.status(201).json({ message: 'Registration successful', success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login - FIXED VERSION
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔐 Login attempt:', { username, passwordLength: password?.length });

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const connection = await db.getConnection();

    try {
      // Get login data
      const [loginUsers] = await connection.query(
        'SELECT * FROM Login WHERE login_username = ?',
        [username]
      );

      if (loginUsers.length === 0) {
        console.log('❌ User not found:', username);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const loginUser = loginUsers[0];
      console.log('✅ Found user:', loginUser.login_username);

      // Compare password
      let passwordMatch = false;

      if (loginUser.login_password.startsWith('$2a$') || loginUser.login_password.startsWith('$2b$')) {
        // Bcrypt hashed password
        passwordMatch = await bcrypt.compare(password, loginUser.login_password);
        console.log('🔍 Bcrypt password match:', passwordMatch);
      } else {
        // Plain text password
        passwordMatch = (password === loginUser.login_password);
        console.log('🔍 Plain text password match:', passwordMatch);
      }

      if (!passwordMatch) {
        console.log('❌ Password mismatch');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Get user and employee details
      const [users] = await connection.query(
        `SELECT u.*, e.emp_id, e.emp_name 
         FROM User u
         LEFT JOIN Employee e ON u.user_id = e.user_id
         WHERE u.login_id = ?`,
        [loginUser.login_id]
      );

      if (users.length === 0) {
        console.log('❌ User profile not found');
        return res.status(401).json({ message: 'User profile not found' });
      }

      const user = users[0];

      // Generate token
      const token = jwt.sign(
        { 
          userId: user.user_id, 
          empId: user.emp_id, 
          username: username 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ Login successful for:', username);

      res.json({
        success: true,
        token,
        user: {
          userId: user.user_id,
          empId: user.emp_id,
          userName: user.user_name,
          empName: user.emp_name,
          username: username
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Change Password
router.post('/change-password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    const connection = await db.getConnection();

    try {
      const [users] = await connection.query(
        'SELECT * FROM Login WHERE login_username = ?',
        [username]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = users[0];
      
      // Check current password
      let passwordMatch = (currentPassword === user.login_password);
      if (!passwordMatch && (user.login_password.startsWith('$2a$') || user.login_password.startsWith('$2b$'))) {
        passwordMatch = await bcrypt.compare(currentPassword, user.login_password);
      }

      if (!passwordMatch) {
        return res.status(401).json({ message: 'Current password incorrect' });
      }

      await connection.query(
        'UPDATE Login SET login_password = ? WHERE login_username = ?',
        [newPassword, username]
      );

      res.json({ message: 'Password changed', success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { username, email, newPassword } = req.body;

    const connection = await db.getConnection();

    try {
      const [users] = await connection.query(
        `SELECT l.login_id, l.login_username 
         FROM Login l
         JOIN User u ON l.login_id = u.login_id
         WHERE l.login_username = ? AND u.user_email = ?`,
        [username, email]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found with this email' });
      }

      await connection.query(
        'UPDATE Login SET login_password = ? WHERE login_username = ?',
        [newPassword, username]
      );

      res.json({ message: 'Password reset', success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
