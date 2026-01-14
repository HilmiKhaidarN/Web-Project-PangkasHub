const db = require('../config/database');

class ServiceModel {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM services ORDER BY name');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(serviceData) {
    const { name, description, duration, price } = serviceData;
    const [result] = await db.query(
      'INSERT INTO services (name, description, duration, price) VALUES (?, ?, ?, ?)',
      [name, description, duration, price]
    );
    return result.insertId;
  }

  static async update(id, serviceData) {
    const { name, description, duration, price } = serviceData;
    const [result] = await db.query(
      'UPDATE services SET name = ?, description = ?, duration = ?, price = ? WHERE id = ?',
      [name, description, duration, price, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM services WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ServiceModel;
