
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const eventsController = require('../controllers/eventsController');

router.use(verifyToken);

router.get('/', eventsController.getEvents);

module.exports = router;
