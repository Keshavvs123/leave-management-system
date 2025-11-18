const API_URL = 'http://localhost:5000/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';

  if (!username || !password) {
    errorDiv.textContent = 'Enter username and password';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      successDiv.textContent = 'Login successful!';
      successDiv.style.display = 'block';

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      errorDiv.textContent = data.message || 'Login failed';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    console.error(error);
    errorDiv.textContent = 'Backend error - Check if server is running on port 5000';
    errorDiv.style.display = 'block';
  }
});
