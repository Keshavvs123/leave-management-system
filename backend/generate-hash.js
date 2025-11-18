const bcrypt = require('bcryptjs');

async function generateHash(password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Original password:', password);
  console.log('Hashed password:', hashedPassword);
}

// Change 'admin123' to your desired password
generateHash('admin123');
