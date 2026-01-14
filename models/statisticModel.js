const db = require('../config/database');

class StatisticModel {
  static async getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // Total booking hari ini
    const [todayBookings] = await db.query(
      'SELECT COUNT(*) as total FROM bookings WHERE booking_date = ? AND status != ?',
      [today, 'cancelled']
    );
    
    // Total pendapatan hari ini
    const [todayRevenue] = await db.query(
      `SELECT SUM(s.price) as total 
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       WHERE b.booking_date = ? AND b.status = ?`,
      [today, 'completed']
    );
    
    // Total booking minggu ini
    const [weekBookings] = await db.query(
      `SELECT COUNT(*) as total FROM bookings 
       WHERE YEARWEEK(booking_date, 1) = YEARWEEK(CURDATE(), 1) AND status != ?`,
      ['cancelled']
    );
    
    // Total pendapatan minggu ini
    const [weekRevenue] = await db.query(
      `SELECT SUM(s.price) as total 
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       WHERE YEARWEEK(b.booking_date, 1) = YEARWEEK(CURDATE(), 1) AND b.status = ?`,
      ['completed']
    );
    
    // Total booking bulan ini
    const [monthBookings] = await db.query(
      `SELECT COUNT(*) as total FROM bookings 
       WHERE YEAR(booking_date) = YEAR(CURDATE()) 
       AND MONTH(booking_date) = MONTH(CURDATE()) AND status != ?`,
      ['cancelled']
    );
    
    // Total pendapatan bulan ini
    const [monthRevenue] = await db.query(
      `SELECT SUM(s.price) as total 
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       WHERE YEAR(b.booking_date) = YEAR(CURDATE()) 
       AND MONTH(b.booking_date) = MONTH(CURDATE()) AND b.status = ?`,
      ['completed']
    );
    
    // Barber paling populer
    const [topBarbers] = await db.query(
      `SELECT br.name, COUNT(*) as total_bookings 
       FROM bookings b 
       JOIN barbers br ON b.barber_id = br.id 
       WHERE b.status != ? 
       GROUP BY b.barber_id 
       ORDER BY total_bookings DESC 
       LIMIT 3`,
      ['cancelled']
    );
    
    // Layanan paling laris
    const [topServices] = await db.query(
      `SELECT s.name, COUNT(*) as total_bookings 
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       WHERE b.status != ? 
       GROUP BY b.service_id 
       ORDER BY total_bookings DESC 
       LIMIT 3`,
      ['cancelled']
    );
    
    return {
      today: {
        bookings: todayBookings[0].total,
        revenue: todayRevenue[0].total || 0
      },
      week: {
        bookings: weekBookings[0].total,
        revenue: weekRevenue[0].total || 0
      },
      month: {
        bookings: monthBookings[0].total,
        revenue: monthRevenue[0].total || 0
      },
      topBarbers,
      topServices
    };
  }
}

module.exports = StatisticModel;
