const db = require('../config/database');

class BarberModel {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM barbers WHERE is_active = TRUE ORDER BY name');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM barbers WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(barberData) {
    const { name, phone } = barberData;
    const [result] = await db.query(
      'INSERT INTO barbers (name, phone) VALUES (?, ?)',
      [name, phone]
    );
    return result.insertId;
  }

  static async update(id, barberData) {
    const { name, phone, is_active } = barberData;
    const [result] = await db.query(
      'UPDATE barbers SET name = ?, phone = ?, is_active = ? WHERE id = ?',
      [name, phone, is_active !== undefined ? is_active : true, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('UPDATE barbers SET is_active = FALSE WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = BarberModel;
