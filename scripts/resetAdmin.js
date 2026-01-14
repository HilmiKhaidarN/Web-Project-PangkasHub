const bcrypt = require('bcrypt');
const db = require('../config/database');

async function resetAdmin() {
  try {
    const username = 'admin';
    const password = 'admin123';
    const name = 'Administrator';

    const hashedPassword = await bcrypt.hash(password, 10);

    // Hapus admin lama jika ada
    await db.query('DELETE FROM admins WHERE username = ?', [username]);

    // Buat admin baru
    const [result] = await db.query(
      'INSERT INTO admins (username, password, name) VALUES (?, ?, ?)',
      [username, hashedPassword, name]
    );

    console.log('✅ Admin berhasil direset!');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Nama:', name);
    console.log('\n🔐 Silakan login di: http://localhost:3000/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdmin();
