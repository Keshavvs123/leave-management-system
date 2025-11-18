const API_URL = 'http://localhost:5000/api';

const adminToken = localStorage.getItem('adminToken');
const admin = JSON.parse(localStorage.getItem('admin') || '{}');

if (!adminToken) {
  window.location.href = 'admin-login.html';
}

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('adminToken');
  localStorage.removeItem('admin');
  window.location.href = 'admin-login.html';
});

document.getElementById('filterStatus').addEventListener('change', loadAllLeaves);

async function loadAllLeaves() {
  try {
    const response = await fetch(`${API_URL}/leaves`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (response.ok) {
      const leaves = await response.json();
      const filterStatus = document.getElementById('filterStatus').value;

      let filteredLeaves = leaves;
      if (filterStatus) {
        filteredLeaves = leaves.filter(leave => leave.lv_status === filterStatus);
      }

      let html = `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Type</th>
              <th>Description</th>
              <th>Days</th>
              <th>Dates</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
      `;

      if (filteredLeaves.length === 0) {
        html += '<tr><td colspan="8" style="text-align: center; padding: 20px;">No leave applications</td></tr>';
      } else {
        filteredLeaves.forEach(leave => {
          const statusClass = `status-${leave.lv_status.toLowerCase()}`;
          const startDate = leave.start_date ? new Date(leave.start_date).toLocaleDateString() : 'N/A';
          const endDate = leave.end_date ? new Date(leave.end_date).toLocaleDateString() : 'N/A';

          html += `
            <tr>
              <td>${leave.lv_id}</td>
              <td>${leave.emp_name || 'N/A'}</td>
              <td>${leave.lvtype_name || 'N/A'}</td>
              <td>${leave.lv_desc}</td>
              <td>${leave.lv_days}</td>
              <td>${startDate} to ${endDate}</td>
              <td><span class="status-badge ${statusClass}">${leave.lv_status}</span></td>
              <td>
                <div class="action-buttons">
                  ${leave.lv_status === 'Pending' ? `
                    <button class="btn-approve btn-small" onclick="updateLeaveStatus(${leave.lv_id}, 'Approved')">✓ Approve</button>
                    <button class="btn-reject btn-small" onclick="updateLeaveStatus(${leave.lv_id}, 'Rejected')">✕ Reject</button>
                  ` : `
                    <button class="btn-small" style="background: #6c757d; cursor: not-allowed;" disabled>${leave.lv_status}</button>
                  `}
                </div>
              </td>
            </tr>
          `;
        });
      }

      html += `
          </tbody>
        </table>
      `;

      document.getElementById('leavesList').innerHTML = html;
    }
  } catch (error) {
    console.error('Error loading leaves:', error);
    document.getElementById('error').textContent = 'Failed to load leave applications';
    document.getElementById('error').style.display = 'block';
  }
}

async function updateLeaveStatus(leaveId, newStatus) {
  if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this leave?`)) {
    return;
  }

  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');

  try {
    const response = await fetch(`${API_URL}/leaves/${leaveId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ lv_status: newStatus })
    });

    const data = await response.json();

    if (response.ok) {
      successDiv.textContent = `Leave ${newStatus.toLowerCase()} successfully!`;
      successDiv.style.display = 'block';
      errorDiv.style.display = 'none';

      setTimeout(() => {
        loadAllLeaves();
        successDiv.style.display = 'none';
      }, 1500);
    } else {
      errorDiv.textContent = data.message || 'Failed to update leave status';
      errorDiv.style.display = 'block';
      successDiv.style.display = 'none';
    }
  } catch (error) {
    console.error('Error updating leave status:', error);
    errorDiv.textContent = 'An error occurred while updating the status';
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
  }
}

loadAllLeaves();
