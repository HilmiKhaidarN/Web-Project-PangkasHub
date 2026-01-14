const db = require('../config/database');

class BookingModel {
  static async create(bookingData) {
    const { customer_id, customer_name, customer_phone, service_id, barber_id, booking_date, booking_time, notes } = bookingData;
    
    const [result] = await db.query(
      'INSERT INTO bookings (customer_id, customer_name, customer_phone, service_id, barber_id, booking_date, booking_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [customer_id, customer_name, customer_phone, service_id, barber_id, booking_date, booking_time, notes]
    );
    
    return result.insertId;
  }

  static async checkAvailability(barber_id, booking_date, booking_time) {
    const [rows] = await db.query(
      'SELECT id FROM bookings WHERE barber_id = ? AND booking_date = ? AND booking_time = ? AND status != ?',
      [barber_id, booking_date, booking_time, 'cancelled']
    );
    return rows.length === 0;
  }

  static async getByDateRange(startDate, endDate, barberId = null) {
    let query = `
      SELECT b.*, s.name as service_name, s.duration, s.price, br.name as barber_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      LEFT JOIN barbers br ON b.barber_id = br.id
      WHERE b.booking_date BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];
    
    if (barberId) {
      query += ' AND b.barber_id = ?';
      params.push(barberId);
    }
    
    query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';
    
    const [rows] = await db.query(query, params);
    return rows;
  }

  static async getAll(limit = 50, offset = 0) {
    const [rows] = await db.query(
      `SELECT b.*, s.name as service_name, s.duration, s.price, br.name as barber_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       LEFT JOIN barbers br ON b.barber_id = br.id
       ORDER BY b.booking_date DESC, b.booking_time DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }

  static async searchBookings(searchTerm) {
    const [rows] = await db.query(
      `SELECT b.*, s.name as service_name, s.duration, s.price, br.name as barber_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       LEFT JOIN barbers br ON b.barber_id = br.id
       WHERE b.customer_name LIKE ? OR b.customer_phone LIKE ?
       ORDER BY b.booking_date DESC, b.booking_time DESC
       LIMIT 50`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  }

  static async updateStatus(id, status) {
    const [result] = await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async getById(id) {
    const [rows] = await db.query(
      `SELECT b.*, s.name as service_name, s.duration, s.price, br.name as barber_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       LEFT JOIN barbers br ON b.barber_id = br.id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async getByCustomerId(customerId) {
    const [rows] = await db.query(
      `SELECT b.*, s.name as service_name, s.duration, s.price, br.name as barber_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       LEFT JOIN barbers br ON b.barber_id = br.id
       WHERE b.customer_id = ?
       ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [customerId]
    );
    return rows;
  }
}

module.exports = BookingModel;
