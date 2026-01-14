const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const { requireAuth, requireCustomerAuth } = require('../middleware/authMiddleware');

router.get('/available-slots', BookingController.getAvailableSlots);
router.get('/all', requireAuth, BookingController.getAllBookings);
router.get('/', requireAuth, BookingController.getByDateRange);
router.get('/my-bookings', requireCustomerAuth, BookingController.getMyBookings);
router.post('/', requireCustomerAuth, BookingController.create);
router.patch('/:id/status', requireAuth, BookingController.updateStatus);

module.exports = router;
