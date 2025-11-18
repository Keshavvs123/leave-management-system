const API_URL = 'http://localhost:5000/api';

document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';

  if (!username || !password) {
    errorDiv.textContent = 'Enter admin username and password';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem('adminToken', JSON.stringify(data.admin));
      successDiv.textContent = 'Admin login successful!';
      successDiv.style.display = 'block';

      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1000);
    } else {
      errorDiv.textContent = data.message || 'Login failed';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    console.error(error);
    errorDiv.textContent = 'Connection error - Backend not running on port 5000';
    errorDiv.style.display = 'block';
  }
});
