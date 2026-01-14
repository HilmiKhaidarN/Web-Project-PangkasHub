const express = require('express');
const router = express.Router();
const BarberController = require('../controllers/barberController');

router.get('/', BarberController.getAll);

module.exports = router;
