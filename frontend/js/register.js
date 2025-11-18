const API_URL = 'http://localhost:5000/api';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const mobile = document.getElementById('mobile').value.trim();
  const address = document.getElementById('address').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';

  // Validation
  if (!name || !email || !mobile || !address || !username || !password) {
    errorDiv.textContent = 'All fields are required';
    errorDiv.style.display = 'block';
    return;
  }

  if (password !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match';
    errorDiv.style.display = 'block';
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters';
    errorDiv.style.display = 'block';
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    errorDiv.textContent = 'Mobile number must be 10 digits';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        name,
        email,
        mobile,
        address
      })
    });

    const data = await response.json();

    if (response.ok) {
      successDiv.textContent = 'Registration successful! Redirecting to login...';
      successDiv.style.display = 'block';

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      errorDiv.textContent = data.message || 'Registration failed';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    console.error(error);
    errorDiv.textContent = 'Connection error - Backend not running';
    errorDiv.style.display = 'block';
  }
});
