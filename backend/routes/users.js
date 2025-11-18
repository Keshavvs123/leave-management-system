const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all users
router.get('/', async (req, res) => {
  try {
    console.log('📥 Fetching users...');
    const connection = await db.getConnection();
    try {
      const [users] = await connection.query(
        'SELECT * FROM User ORDER BY user_id DESC'
      );
      console.log('✅ Users fetched:', users.length);
      res.json(users);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await db.getConnection();
    try {
      const [users] = await connection.query(
        'SELECT * FROM User WHERE user_id = ?',
        [req.params.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(users[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
