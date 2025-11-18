const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔐 Admin login attempt:', { username, passwordLength: password?.length });

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const connection = await db.getConnection();
    try {
      const [admins] = await connection.query(
        'SELECT * FROM Admin WHERE admin_username = ?',
        [username]
      );

      if (admins.length === 0) {
        console.log('❌ Admin not found:', username);
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      const admin = admins[0];
      console.log('✅ Found admin:', admin.admin_username);

      // Compare password
      const passwordMatch = (password === admin.admin_password);

      if (!passwordMatch) {
        console.log('❌ Admin password mismatch');
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      console.log('✅ Admin login successful:', username);

      res.json({
        success: true,
        admin: {
          id: admin.admin_id,
          username: admin.admin_username,
          email: admin.admin_email,
          name: admin.admin_name
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin change password
router.post('/change-password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    const connection = await db.getConnection();
    try {
      const [admins] = await connection.query(
        'SELECT * FROM Admin WHERE admin_username = ?',
        [username]
      );

      if (admins.length === 0) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      if (admins[0].admin_password !== currentPassword) {
        return res.status(401).json({ message: 'Current password incorrect' });
      }

      await connection.query(
        'UPDATE Admin SET admin_password = ? WHERE admin_username = ?',
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

// Admin forgot password - ⭐️ THIS WAS MISSING!
router.post('/forgot-password', async (req, res) => {
  try {
    const { username, email, newPassword } = req.body;

    console.log('🔑 Admin forgot password attempt:', { username, email });

    if (!username || !email || !newPassword) {
      return res.status(400).json({ message: 'All fields required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const connection = await db.getConnection();
    try {
      // Find admin with matching username and email
      const [admins] = await connection.query(
        'SELECT * FROM Admin WHERE admin_username = ? AND admin_email = ?',
        [username, email]
      );

      if (admins.length === 0) {
        console.log('❌ Admin not found with this email');
        return res.status(404).json({ message: 'Admin not found with this email' });
      }

      // Update password
      const [result] = await connection.query(
        'UPDATE Admin SET admin_password = ? WHERE admin_username = ?',
        [newPassword, username]
      );

      console.log('✅ Admin password reset for:', username);

      res.json({ message: 'Password reset successfully', success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
