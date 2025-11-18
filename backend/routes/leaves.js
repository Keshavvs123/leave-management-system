const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// Leave types for dropdown
router.get('/types', async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [leaveTypes] = await connection.query('SELECT * FROM LeaveType');
    connection.release();
    res.json(leaveTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// All leaves
router.get('/', async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [leaves] = await connection.query(
      `SELECT lm.*, e.emp_name, lt.lvtype_name 
       FROM LeaveMaster lm 
       LEFT JOIN Employee e ON lm.emp_id = e.emp_id 
       LEFT JOIN LeaveType lt ON lm.lvtype_id = lt.lvtype_id
       ORDER BY lm.lv_id DESC`
    );
    connection.release();
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get statistics for admin dashboard
router.get('/statistics', async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [stats] = await connection.query(
      `SELECT 
        COUNT(*) as total_leaves,
        SUM(CASE WHEN lv_status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN lv_status = 'Approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN lv_status = 'Rejected' THEN 1 ELSE 0 END) as rejected
       FROM LeaveMaster`
    );
    connection.release();
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee leave balance
router.get('/balance/:empId', async (req, res) => {
  try {
    const { empId } = req.params;
    const connection = await db.getConnection();
    let [balance] = await connection.query(
      'SELECT * FROM EmployeeLeaveBalance WHERE emp_id = ?',
      [empId]
    );
    if (balance.length === 0) {
      await connection.query(
        'INSERT INTO EmployeeLeaveBalance (emp_id) VALUES (?)', [empId]
      );
      [balance] = await connection.query(
        'SELECT * FROM EmployeeLeaveBalance WHERE emp_id = ?', [empId]
      );
    }
    connection.release();
    res.json(balance[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply for leave
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { emp_id, lvtype_id, lv_desc, lv_days, start_date, end_date } = req.body;
    const connection = await db.getConnection();
    const [result] = await connection.query(
      `INSERT INTO LeaveMaster (emp_id, lvtype_id, lv_desc, lv_status, lv_days, start_date, end_date) 
       VALUES (?, ?, ?, 'Pending', ?, ?, ?)`,
      [emp_id, lvtype_id, lv_desc, lv_days, start_date, end_date]
    );
    connection.release();
    res.status(201).json({ success: true, lv_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject leave AND update balance
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { lv_status } = req.body;
    const connection = await db.getConnection();

    const [leave] = await connection.query(
      'SELECT emp_id, lv_days, lv_status FROM LeaveMaster WHERE lv_id = ?',
      [id]
    );
    if (leave.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Leave not found' });
    }
    const emp_id = leave[0].emp_id;
    const lv_days = leave[0].lv_days;
    const oldStatus = leave[0].lv_status;

    await connection.query(
      'UPDATE LeaveMaster SET lv_status = ? WHERE lv_id = ?',
      [lv_status, id]
    );
    if (lv_status === 'Approved' && oldStatus !== 'Approved') {
      await connection.query(
        `UPDATE EmployeeLeaveBalance 
         SET used_leaves = used_leaves + ?, remaining_leaves = remaining_leaves - ?
         WHERE emp_id = ?`, [lv_days, lv_days, emp_id]
      );
    } else if (lv_status === 'Rejected' && oldStatus === 'Approved') {
      await connection.query(
        `UPDATE EmployeeLeaveBalance 
         SET used_leaves = used_leaves - ?, remaining_leaves = remaining_leaves + ?
         WHERE emp_id = ?`, [lv_days, lv_days, emp_id]
      );
    }
    connection.release();
    res.json({ success: true, message: `Leave ${lv_status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
