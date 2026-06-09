
const express = require('express');
const router = express.Router();
const noticesController = require('../controllers/noticesController');
const { verifyToken, authorizeRoles, optionalVerifyToken } = require('../middleware/authMiddleware');

router.get('/', optionalVerifyToken, noticesController.getFeed);

router.post('/', verifyToken, authorizeRoles('ADMIN', 'TEACHER'), noticesController.createNotice);
router.put('/:id', verifyToken, authorizeRoles('ADMIN', 'TEACHER'), noticesController.updateNotice);
router.delete('/:id', verifyToken, authorizeRoles('ADMIN', 'TEACHER'), noticesController.deleteNotice);

module.exports = router;