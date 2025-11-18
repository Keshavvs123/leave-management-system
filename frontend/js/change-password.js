const API_URL = 'http://localhost:5000/api';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Check if logged in
if (!token || !user.username) {
  window.location.href = 'login.html';
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
});

// Change password form
document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    errorDiv.textContent = 'New passwords do not match';
    errorDiv.style.display = 'block';
    return;
  }

  // Validate password length
  if (newPassword.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters';
    errorDiv.style.display = 'block';
    return;
  }

  // Validate different from current
  if (currentPassword === newPassword) {
    errorDiv.textContent = 'New password must be different from current';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: user.username,
        currentPassword,
        newPassword
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      successDiv.textContent = 'Password changed successfully! Redirecting to login...';
      successDiv.style.display = 'block';

      // Clear storage and redirect
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
      }, 2000);
    } else {
      errorDiv.textContent = data.message || 'Failed to change password';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    console.error(error);
    errorDiv.textContent = 'Connection error or backend not running';
    errorDiv.style.display = 'block';
  }
});
