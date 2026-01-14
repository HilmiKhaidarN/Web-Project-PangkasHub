const express = require('express');
const router = express.Router();
const StatisticController = require('../controllers/statisticController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/dashboard', requireAuth, StatisticController.getDashboardStats);

module.exports = router;
