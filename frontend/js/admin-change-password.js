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

document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');
  const submitButton = e.target.querySelector('button[type="submit"]');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';

  if (newPassword !== confirmPassword) {
    errorDiv.textContent = 'New passwords do not match';
    errorDiv.style.display = 'block';
    return;
  }

  if (newPassword.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters';
    errorDiv.style.display = 'block';
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Changing...';

  try {
    const response = await fetch(`${API_URL}/admin-auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      successDiv.textContent = 'Password changed successfully! Logging out in 2 seconds...';
      successDiv.style.display = 'block';

      setTimeout(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        window.location.href = 'admin-login.html';
      }, 2000);
    } else {
      errorDiv.textContent = data.message || 'Failed to change password';
      errorDiv.style.display = 'block';
      submitButton.disabled = false;
      submitButton.textContent = 'Change Password';
    }
  } catch (error) {
    console.error('Error:', error);
    errorDiv.textContent = 'An error occurred. Please try again.';
    errorDiv.style.display = 'block';
    submitButton.disabled = false;
    submitButton.textContent = 'Change Password';
  }
});
