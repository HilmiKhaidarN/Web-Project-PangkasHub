const db = require('../config/database');

class ReviewModel {
  // Create review
  static async create(reviewData) {
    const { booking_id, customer_id, barber_id, service_id, rating, review_text } = reviewData;
    
    const [result] = await db.query(
      `INSERT INTO reviews (booking_id, customer_id, barber_id, service_id, rating, review_text)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [booking_id, customer_id, barber_id, service_id, rating, review_text]
    );
    
    return result;
  }

  // Check if booking already has review
  static async existsByBookingId(bookingId) {
    const [rows] = await db.query(
      'SELECT id FROM reviews WHERE booking_id = ?',
      [bookingId]
    );
    return rows.length > 0;
  }

  // Get review by booking ID
  static async getByBookingId(bookingId) {
    const [rows] = await db.query(
      `SELECT r.*, c.name as customer_name, b.name as barber_name, s.name as service_name
       FROM reviews r
       JOIN customers c ON r.customer_id = c.id
       LEFT JOIN barbers b ON r.barber_id = b.id
       JOIN services s ON r.service_id = s.id
       WHERE r.booking_id = ?`,
      [bookingId]
    );
    return rows[0];
  }

  // Get all reviews for a barber
  static async getByBarberId(barberId) {
    const [rows] = await db.query(
      `SELECT r.*, c.name as customer_name, s.name as service_name
       FROM reviews r
       JOIN customers c ON r.customer_id = c.id
       JOIN services s ON r.service_id = s.id
       WHERE r.barber_id = ?
       ORDER BY r.created_at DESC`,
      [barberId]
    );
    return rows;
  }

  // Get all reviews for a service
  static async getByServiceId(serviceId) {
    const [rows] = await db.query(
      `SELECT r.*, c.name as customer_name, b.name as barber_name
       FROM reviews r
       JOIN customers c ON r.customer_id = c.id
       LEFT JOIN barbers b ON r.barber_id = b.id
       WHERE r.service_id = ?
       ORDER BY r.created_at DESC`,
      [serviceId]
    );
    return rows;
  }

  // Get average rating for a barber
  static async getBarberAverageRating(barberId) {
    const [rows] = await db.query(
      `SELECT 
        ROUND(AVG(rating), 1) as average_rating,
        COUNT(*) as total_reviews
       FROM reviews
       WHERE barber_id = ?`,
      [barberId]
    );
    return rows[0];
  }

  // Get average rating for a service
  static async getServiceAverageRating(serviceId) {
    const [rows] = await db.query(
      `SELECT 
        ROUND(AVG(rating), 1) as average_rating,
        COUNT(*) as total_reviews
       FROM reviews
       WHERE service_id = ?`,
      [serviceId]
    );
    return rows[0];
  }

  // Get all barbers with their ratings
  static async getAllBarbersWithRatings() {
    const [rows] = await db.query(
      `SELECT 
        b.id,
        b.name,
        b.phone,
        ROUND(AVG(r.rating), 1) as average_rating,
        COUNT(r.id) as total_reviews
       FROM barbers b
       LEFT JOIN reviews r ON b.id = r.barber_id
       WHERE b.is_active = TRUE
       GROUP BY b.id, b.name, b.phone
       ORDER BY average_rating DESC, total_reviews DESC`
    );
    return rows;
  }

  // Get all services with their ratings
  static async getAllServicesWithRatings() {
    const [rows] = await db.query(
      `SELECT 
        s.id,
        s.name,
        s.description,
        s.duration,
        s.price,
        ROUND(AVG(r.rating), 1) as average_rating,
        COUNT(r.id) as total_reviews
       FROM services s
       LEFT JOIN reviews r ON s.id = r.service_id
       GROUP BY s.id, s.name, s.description, s.duration, s.price
       ORDER BY average_rating DESC, total_reviews DESC`
    );
    return rows;
  }

  // Get recent reviews (for display)
  static async getRecentReviews(limit = 10) {
    const [rows] = await db.query(
      `SELECT r.*, c.name as customer_name, b.name as barber_name, s.name as service_name
       FROM reviews r
       JOIN customers c ON r.customer_id = c.id
       LEFT JOIN barbers b ON r.barber_id = b.id
       JOIN services s ON r.service_id = s.id
       ORDER BY r.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }
}

module.exports = ReviewModel;
