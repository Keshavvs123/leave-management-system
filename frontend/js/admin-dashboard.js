const API_URL = 'http://localhost:5000/api';

const adminData = localStorage.getItem('adminToken');

if (!adminData) {
  window.location.href = 'admin-login.html';
}

const admin = JSON.parse(adminData);

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('adminToken');
  localStorage.removeItem('isAdmin');
  window.location.href = 'admin-login.html';
});

// Load all leaves
async function loadPendingLeaves() {
  try {
    console.log('📥 Fetching leaves...');
    const response = await fetch(`${API_URL}/leaves`);

    if (response.ok) {
      const data = await response.json();
      console.log('Total leaves fetched:', data.length);
      
      const pendingLeaves = data.filter(l => l.lv_status === 'Pending');
      console.log('Pending leaves:', pendingLeaves.length);

      let html = '<table style="width: 100%; border-collapse: collapse;"><thead><tr style="background: #f5f5f5;"><th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Employee</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Type</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Days</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">From - To</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Description</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Action</th></tr></thead><tbody>';

      if (pendingLeaves.length === 0) {
        html += '<tr><td colspan="6" style="text-align: center; padding: 30px; color: #999;">✓ No pending leave applications</td></tr>';
      } else {
        pendingLeaves.forEach(leave => {
          html += `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px;"><strong>${leave.emp_name || 'N/A'}</strong></td>
              <td style="padding: 12px;">${leave.lvtype_name || 'N/A'}</td>
              <td style="padding: 12px;"><strong>${leave.lv_days}</strong></td>
              <td style="padding: 12px;">${new Date(leave.start_date).toLocaleDateString('en-IN')} - ${new Date(leave.end_date).toLocaleDateString('en-IN')}</td>
              <td style="padding: 12px;">${leave.lv_desc || '-'}</td>
              <td style="padding: 12px;">
                <button onclick="window.approveLeave(${leave.lv_id})" style="padding: 8px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px; font-weight: 600;">✓ Approve</button>
                <button onclick="window.rejectLeave(${leave.lv_id})" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">✕ Reject</button>
              </td>
            </tr>
          `;
        });
      }

      html += '</tbody></table>';
      document.getElementById('pendingLeavesList').innerHTML = html;
    }
  } catch (error) {
    console.error('❌ Error loading leaves:', error);
  }
}

// Load statistics
async function loadStatistics() {
  try {
    console.log('📊 Fetching statistics...');
    const response = await fetch(`${API_URL}/leaves/statistics`);

    if (response.ok) {
      const stats = await response.json();
      console.log('Statistics:', stats);
      
      document.getElementById('totalLeaves').textContent = stats.total_leaves || 0;
      document.getElementById('pendingLeaves').textContent = stats.pending || 0;
      document.getElementById('approvedLeaves').textContent = stats.approved || 0;
      document.getElementById('rejectedLeaves').textContent = stats.rejected || 0;
    }
  } catch (error) {
    console.error('❌ Error loading statistics:', error);
  }
}

// Approve leave
window.approveLeave = async function(leaveId) {
  if (!confirm('Are you sure you want to approve this leave?')) return;

  try {
    console.log('✅ Approving leave ID:', leaveId);
    
    const response = await fetch(`${API_URL}/leaves/${leaveId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lv_status: 'Approved' })
    });

    const data = await response.json();
    console.log('Approve response:', data);

    if (response.ok && data.success) {
      alert('✓ Leave approved successfully!');
      
      // Reload data with small delay to ensure database updated
      setTimeout(() => {
        console.log('🔄 Reloading data after approval...');
        loadPendingLeaves();
        loadStatistics();
      }, 500);
    } else {
      alert('❌ Failed: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error: ' + error.message);
  }
};

// Reject leave
window.rejectLeave = async function(leaveId) {
  if (!confirm('Are you sure you want to reject this leave?')) return;

  try {
    console.log('❌ Rejecting leave ID:', leaveId);
    
    const response = await fetch(`${API_URL}/leaves/${leaveId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lv_status: 'Rejected' })
    });

    const data = await response.json();
    console.log('Reject response:', data);

    if (response.ok && data.success) {
      alert('✓ Leave rejected!');
      
      // Reload data with small delay
      setTimeout(() => {
        console.log('🔄 Reloading data after rejection...');
        loadPendingLeaves();
        loadStatistics();
      }, 500);
    } else {
      alert('❌ Failed: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error: ' + error.message);
  }
};

console.log('✅ Admin dashboard loaded');

// Initial load
loadStatistics();
loadPendingLeaves();

// Auto-refresh every 10 seconds
setInterval(() => {
  console.log('🔄 Auto-refreshing...');
  loadStatistics();
  loadPendingLeaves();
}, 10000);
