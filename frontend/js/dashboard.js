const API_URL = 'http://localhost:5000/api';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
  window.location.href = 'login.html';
}

document.getElementById('userName').textContent = user.empName || user.userName || 'User';

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
});

// Load leave balance
async function loadLeaveBalance() {
  try {
    const response = await fetch(`${API_URL}/leaves/balance/${user.empId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const balance = await response.json();
      
      document.getElementById('totalAllowed').textContent = balance.total_allowed_leaves || 20;
      document.getElementById('usedLeaves').textContent = balance.used_leaves || 0;
      document.getElementById('remainingLeaves').textContent = balance.remaining_leaves || 20;
      
      if (balance.penalty_days > 0) {
        document.getElementById('penaltyWarning').style.display = 'block';
        document.getElementById('penaltyAmount').textContent = balance.penalty_amount.toFixed(2);
      }
    }
  } catch (error) {
    console.error('Error loading balance:', error);
  }
}

// Load leaves
async function loadRecentLeaves() {
  try {
    const response = await fetch(`${API_URL}/leaves`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const allLeaves = await response.json();
      const myLeaves = allLeaves.filter(l => l.emp_id === user.empId).slice(0, 5);

      let html = '<table><thead><tr><th>Type</th><th>Days</th><th>Status</th><th>Dates</th></tr></thead><tbody>';

      if (myLeaves.length === 0) {
        html += '<tr><td colspan="4" style="text-align: center; padding: 20px;">No leaves</td></tr>';
      } else {
        myLeaves.forEach(leave => {
          const statusClass = `status-${leave.lv_status.toLowerCase()}`;
          html += `
            <tr>
              <td>${leave.lvtype_name}</td>
              <td>${leave.lv_days}</td>
              <td><span class="status-badge ${statusClass}">${leave.lv_status}</span></td>
              <td>${new Date(leave.start_date).toLocaleDateString()} - ${new Date(leave.end_date).toLocaleDateString()}</td>
            </tr>
          `;
        });
      }

      html += '</tbody></table>';
      document.getElementById('leavesList').innerHTML = html;
    }
  } catch (error) {
    console.error('Error loading leaves:', error);
  }
}

loadLeaveBalance();
loadRecentLeaves();
