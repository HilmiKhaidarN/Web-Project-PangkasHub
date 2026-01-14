const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireCustomerAuth } = require('../middleware/authMiddleware');

// Create review (customer only)
router.post('/', requireCustomerAuth, reviewController.createReview);

// Get review by booking ID
router.get('/booking/:bookingId', reviewController.getReviewByBooking);

// Get barbers with ratings (public)
router.get('/barbers', reviewController.getBarbersWithRatings);

// Get services with ratings (public)
router.get('/services', reviewController.getServicesWithRatings);

// Get reviews for specific barber
router.get('/barber/:barberId', reviewController.getBarberReviews);

// Get reviews for specific service
router.get('/service/:serviceId', reviewController.getServiceReviews);

// Get recent reviews
router.get('/recent', reviewController.getRecentReviews);

module.exports = router;
