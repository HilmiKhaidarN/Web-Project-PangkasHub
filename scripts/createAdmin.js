const bcrypt = require('bcrypt');
const db = require('../config/database');

async function createAdmin() {
  try {
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Administrator';

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO admins (username, password, name) VALUES (?, ?, ?)',
      [username, hashedPassword, name]
    );

    console.log('✅ Admin berhasil dibuat!');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Nama:', name);
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('❌ Username sudah digunakan');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

createAdmin();
