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

// Load statistics
async function loadStatistics() {
  try {
    const response = await fetch(`${API_URL}/leaves/statistics`);

    if (response.ok) {
      const stats = await response.json();
      document.getElementById('totalLeaves').textContent = stats.total_leaves || 0;
      document.getElementById('pendingLeaves').textContent = stats.pending || 0;
      document.getElementById('approvedLeaves').textContent = stats.approved || 0;
      document.getElementById('rejectedLeaves').textContent = stats.rejected || 0;
    }
  } catch (error) {
    console.error(error);
  }
}

// Load employees count
async function loadEmployeeStats() {
  try {
    const response = await fetch(`${API_URL}/employees`);

    if (response.ok) {
      const employees = await response.json();
      document.getElementById('totalEmployees').textContent = employees.length;
    }
  } catch (error) {
    console.error(error);
  }
}

// Load approved leaves
async function loadApprovedLeaves() {
  try {
    const response = await fetch(`${API_URL}/leaves`);

    if (response.ok) {
      const allLeaves = await response.json();
      const approvedLeaves = allLeaves.filter(l => l.lv_status === 'Approved');

      let html = '<table style="width: 100%; border-collapse: collapse;"><thead><tr style="background: #f5f5f5;"><th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Employee</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Type</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Days</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">From - To</th></tr></thead><tbody>';

      if (approvedLeaves.length === 0) {
        html += '<tr><td colspan="4" style="text-align: center; padding: 30px; color: #999;">No approved leaves</td></tr>';
      } else {
        approvedLeaves.forEach(leave => {
          html += `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px;">${leave.emp_name}</td>
              <td style="padding: 12px;">${leave.lvtype_name}</td>
              <td style="padding: 12px;">${leave.lv_days}</td>
              <td style="padding: 12px;">${new Date(leave.start_date).toLocaleDateString('en-IN')} - ${new Date(leave.end_date).toLocaleDateString('en-IN')}</td>
            </tr>
          `;
        });
      }

      html += '</tbody></table>';
      document.getElementById('approvedLeavesList').innerHTML = html;
    }
  } catch (error) {
    console.error(error);
  }
}

loadStatistics();
loadEmployeeStats();
loadApprovedLeaves();
