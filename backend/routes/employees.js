const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all employees
router.get('/', async (req, res) => {
  try {
    console.log('📥 Fetching employees...');
    const connection = await db.getConnection();
    try {
      const [employees] = await connection.query(
        'SELECT * FROM Employee ORDER BY emp_id DESC'
      );
      console.log('✅ Employees fetched:', employees.length);
      res.json(employees);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Error fetching employees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await db.getConnection();
    try {
      const [employees] = await connection.query(
        'SELECT * FROM Employee WHERE emp_id = ?',
        [req.params.id]
      );

      if (employees.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json(employees[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
