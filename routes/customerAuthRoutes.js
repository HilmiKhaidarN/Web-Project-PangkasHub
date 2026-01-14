const express = require('express');
const router = express.Router();
const CustomerAuthController = require('../controllers/customerAuthController');
const { requireCustomerAuth } = require('../middleware/authMiddleware');

router.post('/register', CustomerAuthController.register);
router.post('/login', CustomerAuthController.login);
router.post('/logout', CustomerAuthController.logout);
router.get('/check', CustomerAuthController.checkAuth);
router.get('/profile', requireCustomerAuth, CustomerAuthController.getProfile);

module.exports = router;
