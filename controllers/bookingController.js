const BookingModel = require('../models/bookingModel');
const ServiceModel = require('../models/serviceModel');

class BookingController {
  static async getAvailableSlots(req, res) {
    try {
      const { date, barber_id } = req.query;
      
      if (!date) {
        return res.status(400).json({ success: false, message: 'Tanggal harus diisi' });
      }

      // Jam operasional: 09:00 - 20:00, interval 30 menit
      const slots = [];
      const startHour = 9;
      const endHour = 20;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute of [0, 30]) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
          slots.push(time);
        }
      }

      // Cek ketersediaan untuk setiap slot
      const availableSlots = [];
      for (const slot of slots) {
        const isAvailable = await BookingModel.checkAvailability(barber_id || null, date, slot);
        availableSlots.push({
          time: slot,
          display: slot.substring(0, 5),
          available: isAvailable
        });
      }

      res.json({ success: true, data: availableSlots });
    } catch (error) {
      console.error('Error fetching available slots:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil slot waktu' });
    }
  }

  static async create(req, res) {
    try {
      const { customer_name, customer_phone, service_id, barber_id, booking_date, booking_time, notes } = req.body;

      // Validasi input
      if (!customer_name || !customer_phone || !service_id || !booking_date || !booking_time) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
      }

      // Validasi service exists
      const service = await ServiceModel.getById(service_id);
      if (!service) {
        return res.status(400).json({ success: false, message: 'Layanan tidak ditemukan' });
      }

      // Cek ketersediaan
      const isAvailable = await BookingModel.checkAvailability(barber_id, booking_date, booking_time);
      if (!isAvailable) {
        return res.status(409).json({ success: false, message: 'Slot waktu sudah dibooking' });
      }

      // Ambil customer_id dari session jika login
      const customer_id = req.session.customerId || null;

      const bookingId = await BookingModel.create({
        customer_id,
        customer_name,
        customer_phone,
        service_id,
        barber_id: barber_id || null,
        booking_date,
        booking_time,
        notes: notes || null
      });

      const booking = await BookingModel.getById(bookingId);
      
      // Emit real-time notification to admin
      const io = req.app.get('io');
      io.emit('newBooking', {
        booking,
        message: `Booking baru dari ${customer_name}`,
        timestamp: new Date()
      });
      
      res.status(201).json({ success: true, message: 'Booking berhasil dibuat', data: booking });
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'Slot waktu sudah dibooking' });
      }
      res.status(500).json({ success: false, message: 'Gagal membuat booking' });
    }
  }

  static async getMyBookings(req, res) {
    try {
      const customerId = req.session.customerId;
      const bookings = await BookingModel.getByCustomerId(customerId);
      res.json({ success: true, data: bookings });
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data booking' });
    }
  }

  static async getAllBookings(req, res) {
    try {
      const { search } = req.query;
      
      let bookings;
      if (search) {
        bookings = await BookingModel.searchBookings(search);
      } else {
        bookings = await BookingModel.getAll();
      }
      
      res.json({ success: true, data: bookings });
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data booking' });
    }
  }

  static async getByDateRange(req, res) {
    try {
      const { start_date, end_date, barber_id } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'Tanggal mulai dan akhir harus diisi' });
      }

      const bookings = await BookingModel.getByDateRange(start_date, end_date, barber_id);
      res.json({ success: true, data: bookings });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data booking' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status tidak valid' });
      }

      const updated = await BookingModel.updateStatus(id, status);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
      }

      const booking = await BookingModel.getById(id);
      
      // Emit real-time update to all admins
      const io = req.app.get('io');
      io.emit('bookingUpdated', {
        booking,
        message: `Status booking ${booking.customer_name} diubah menjadi ${status}`,
        timestamp: new Date()
      });
      
      res.json({ success: true, message: 'Status berhasil diupdate', data: booking });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ success: false, message: 'Gagal mengupdate status' });
    }
  }
}

module.exports = BookingController;
