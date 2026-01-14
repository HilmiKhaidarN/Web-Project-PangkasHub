const db = require('../config/database');
const bcrypt = require('bcrypt');

class AdminModel {
  static async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    return rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async create(username, password, name) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO admins (username, password, name) VALUES (?, ?, ?)',
      [username, hashedPassword, name]
    );
    return result.insertId;
  }
}

module.exports = AdminModel;
