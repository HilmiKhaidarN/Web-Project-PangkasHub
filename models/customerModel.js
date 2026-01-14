const db = require('../config/database');
const bcrypt = require('bcrypt');

class CustomerModel {
  static async findByPhone(phone) {
    const [rows] = await db.query('SELECT * FROM customers WHERE phone = ?', [phone]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(customerData) {
    const { name, phone, email, password } = customerData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      'INSERT INTO customers (name, phone, email, password) VALUES (?, ?, ?, ?)',
      [name, phone, email, hashedPassword]
    );
    
    return result.insertId;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT id, name, phone, email, created_at FROM customers WHERE id = ?', [id]);
    return rows[0];
  }

  static async updateProfile(id, data) {
    const { name, email } = data;
    const [result] = await db.query(
      'UPDATE customers SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CustomerModel;
