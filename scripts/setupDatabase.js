const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // Connect tanpa database dulu
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      multipleStatements: true
    });

    console.log('✅ Koneksi ke MySQL berhasil');

    // Baca file schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Eksekusi schema
    await connection.query(schema);
    
    console.log('✅ Database dan tabel berhasil dibuat');
    console.log('✅ Data awal berhasil dimasukkan');
    console.log('\n📊 Database: pangkashub');
    console.log('📋 Tabel: services, barbers, bookings, admins, customers');
    console.log('\n👤 Admin default:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n🚀 Jalankan: npm start');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
