const API_URL = 'http://localhost:5000/api';

document.getElementById('adminForgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';

  // Validation
  if (!username || !email || !newPassword) {
    errorDiv.textContent = 'All fields are required';
    errorDiv.style.display = 'block';
    return;
  }

  if (newPassword.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    console.log('Attempting admin password reset:', { username, email });

    const response = await fetch(`${API_URL}/admin/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, newPassword })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (response.ok && data.success) {
      successDiv.textContent = 'Password reset successful! Redirecting...';
      successDiv.style.display = 'block';

      setTimeout(() => {
        window.location.href = 'admin-login.html';
      }, 2000);
    } else {
      errorDiv.textContent = data.message || 'Password reset failed';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    console.error('Error:', error);
    errorDiv.textContent = 'Connection error: ' + error.message;
    errorDiv.style.display = 'block';
  }
});
