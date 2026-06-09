
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.use(verifyToken);
router.use(authorizeRoles('ADMIN'));

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.get('/stats', adminController.getStats);
router.post('/events', adminController.createEvent);

module.exports = router;
