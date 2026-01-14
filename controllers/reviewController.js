const ReviewModel = require('../models/reviewModel');
const BookingModel = require('../models/bookingModel');

// Create review
async function createReview(req, res) {
  try {
    const { booking_id, rating, review_text } = req.body;
    const customerId = req.session.customerId;

    // Validasi input
    if (!booking_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID dan rating wajib diisi'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus antara 1-5'
      });
    }

    // Cek apakah booking ada dan milik customer ini
    const booking = await BookingModel.getById(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    if (booking.customer_id !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke booking ini'
      });
    }

    // Cek apakah booking sudah selesai
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Hanya booking yang sudah selesai yang bisa direview'
      });
    }

    // Cek apakah sudah ada review untuk booking ini
    const existingReview = await ReviewModel.existsByBookingId(booking_id);
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Booking ini sudah direview'
      });
    }

    // Buat review
    const reviewData = {
      booking_id,
      customer_id: customerId,
      barber_id: booking.barber_id,
      service_id: booking.service_id,
      rating,
      review_text: review_text || null
    };

    await ReviewModel.create(reviewData);

    res.json({
      success: true,
      message: 'Review berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan review'
    });
  }
}

// Get review by booking ID
async function getReviewByBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const review = await ReviewModel.getByBookingId(bookingId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error getting review:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil review'
    });
  }
}

// Get barbers with ratings
async function getBarbersWithRatings(req, res) {
  try {
    const barbers = await ReviewModel.getAllBarbersWithRatings();
    res.json({
      success: true,
      data: barbers
    });
  } catch (error) {
    console.error('Error getting barbers with ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data barber'
    });
  }
}

// Get services with ratings
async function getServicesWithRatings(req, res) {
  try {
    const services = await ReviewModel.getAllServicesWithRatings();
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error getting services with ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data layanan'
    });
  }
}

// Get reviews for a barber
async function getBarberReviews(req, res) {
  try {
    const { barberId } = req.params;
    const reviews = await ReviewModel.getByBarberId(barberId);
    const stats = await ReviewModel.getBarberAverageRating(barberId);

    res.json({
      success: true,
      data: {
        reviews,
        stats
      }
    });
  } catch (error) {
    console.error('Error getting barber reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil review barber'
    });
  }
}

// Get reviews for a service
async function getServiceReviews(req, res) {
  try {
    const { serviceId } = req.params;
    const reviews = await ReviewModel.getByServiceId(serviceId);
    const stats = await ReviewModel.getServiceAverageRating(serviceId);

    res.json({
      success: true,
      data: {
        reviews,
        stats
      }
    });
  } catch (error) {
    console.error('Error getting service reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil review layanan'
    });
  }
}

// Get recent reviews
async function getRecentReviews(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const reviews = await ReviewModel.getRecentReviews(limit);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error getting recent reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil review terbaru'
    });
  }
}

module.exports = {
  createReview,
  getReviewByBooking,
  getBarbersWithRatings,
  getServicesWithRatings,
  getBarberReviews,
  getServiceReviews,
  getRecentReviews
};
