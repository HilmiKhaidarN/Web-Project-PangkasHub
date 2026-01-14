const mysql = require('mysql2/promise');
require('dotenv').config();

async function addReviewsTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('✅ Koneksi ke database berhasil');

    // Create reviews table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT NOT NULL UNIQUE,
        customer_id INT NOT NULL,
        barber_id INT,
        service_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE SET NULL,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ Tabel reviews berhasil dibuat');
    console.log('\n📊 Fitur Rating & Review System siap digunakan!');
    console.log('🚀 Jalankan: npm start');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addReviewsTable();
