const express = require('express');
const router = express.Router();
const BarberController = require('../controllers/barberController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', BarberController.getAll);
router.post('/', requireAuth, BarberController.create);
router.put('/:id', requireAuth, BarberController.update);
router.delete('/:id', requireAuth, BarberController.delete);

module.exports = router;
