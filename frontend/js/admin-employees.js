const API_URL = 'http://localhost:5000/api';

const adminData = localStorage.getItem('adminToken');

if (!adminData) {
  window.location.href = 'admin-login.html';
}

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('adminToken');
  localStorage.removeItem('isAdmin');
  window.location.href = 'admin-login.html';
});

// Load employees with their leaves
async function loadEmployees() {
  try {
    console.log('📥 Fetching employees...');
    const [employeesRes, leavesRes, balanceRes] = await Promise.all([
      fetch(`${API_URL}/employees`),
      fetch(`${API_URL}/leaves`),
      fetch(`${API_URL}/employees`) // We'll get balance per employee
    ]);

    const employees = await employeesRes.json();
    const allLeaves = await leavesRes.json();

    let html = '';

    for (const emp of employees) {
      // Get leave balance for this employee
      const balanceRes = await fetch(`${API_URL}/leaves/balance/${emp.emp_id}`);
      const balance = await balanceRes.json();

      // Get leaves for this employee
      const empLeaves = allLeaves.filter(l => l.emp_id === emp.emp_id);

      // Build employee card
      html += `
        <div class="employee-card">
          <div class="employee-header">
            <div class="emp-info">
              <label>Employee Name</label>
              <value>${emp.emp_name}</value>
            </div>
            <div class="emp-info">
              <label>Email</label>
              <value>${emp.emp_email || '-'}</value>
            </div>
            <div class="emp-info">
              <label>Mobile</label>
              <value>${emp.emp_mobile || '-'}</value>
            </div>
          </div>

          <div class="balance-section">
            <div class="balance-item">
              <div class="balance-label">Total Allowed</div>
              <div class="balance-value">${balance.total_allowed_leaves || 20}</div>
            </div>
            <div class="balance-item">
              <div class="balance-label">Used</div>
              <div class="balance-value" style="color: #ff9800;">${balance.used_leaves || 0}</div>
            </div>
            <div class="balance-item">
              <div class="balance-label">Remaining</div>
              <div class="balance-value" style="color: #4caf50;">${balance.remaining_leaves || 20}</div>
            </div>
            <div class="balance-item">
              <div class="balance-label">Penalty Days</div>
              <div class="balance-value" style="color: #f44336;">${balance.penalty_days || 0}</div>
            </div>
          </div>

          <h3 style="margin-top: 20px; margin-bottom: 10px;">📋 Leave Requests</h3>
          ${renderEmployeeLeaves(empLeaves, emp.emp_id)}
        </div>
      `;
    }

    document.getElementById('employeesList').innerHTML = html;
  } catch (error) {
    console.error('❌ Error loading employees:', error);
    document.getElementById('employeesList').innerHTML = '<p style="color: red;">Error loading employees</p>';
  }
}

// Render leaves for specific employee
function renderEmployeeLeaves(leaves, empId) {
  if (leaves.length === 0) {
    return '<p style="color: #999;">No leave requests</p>';
  }

  let html = `
    <table class="leaves-table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Days</th>
          <th>Date Range</th>
          <th>Description</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;

  leaves.forEach(leave => {
    const statusClass = `status-${leave.lv_status.toLowerCase()}`;
    let actionButtons = '';

    if (leave.lv_status === 'Pending') {
      actionButtons = `
        <button class="btn-approve" onclick="approveLeaveFinal(${leave.lv_id})">✓ Approve</button>
        <button class="btn-reject" onclick="rejectLeaveFinal(${leave.lv_id})">✕ Reject</button>
      `;
    }

    html += `
      <tr>
        <td>${leave.lvtype_name || 'N/A'}</td>
        <td>${leave.lv_days}</td>
        <td>${new Date(leave.start_date).toLocaleDateString('en-IN')} - ${new Date(leave.end_date).toLocaleDateString('en-IN')}</td>
        <td>${leave.lv_desc || '-'}</td>
        <td><span class="status-badge ${statusClass}">${leave.lv_status}</span></td>
        <td>${actionButtons || '-'}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
}

// Approve leave
window.approveLeaveFinal = async function(leaveId) {
  if (!confirm('Approve this leave request?')) return;

  try {
    const response = await fetch(`${API_URL}/leaves/${leaveId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lv_status: 'Approved' })
    });

    if (response.ok) {
      alert('✓ Leave approved!');
      loadEmployees(); // Reload to show updated data
    } else {
      alert('Failed to approve');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error approving leave');
  }
};

// Reject leave
window.rejectLeaveFinal = async function(leaveId) {
  if (!confirm('Reject this leave request?')) return;

  try {
    const response = await fetch(`${API_URL}/leaves/${leaveId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lv_status: 'Rejected' })
    });

    if (response.ok) {
      alert('✓ Leave rejected!');
      loadEmployees(); // Reload to show updated data
    } else {
      alert('Failed to reject');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error rejecting leave');
  }
};

console.log('Admin employees page loaded');
loadEmployees();
