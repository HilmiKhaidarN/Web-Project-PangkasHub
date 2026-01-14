const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/serviceController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', ServiceController.getAll);
router.post('/', requireAuth, ServiceController.create);
router.put('/:id', requireAuth, ServiceController.update);
router.delete('/:id', requireAuth, ServiceController.delete);

module.exports = router;
