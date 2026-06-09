const express = require('express');
const router = express.Router();

const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const studentController = require('../controllers/studentController');

router.use(verifyToken);
router.use(authorizeRoles('STUDENT'));

router.get('/dashboard', studentController.getDashboard);

router.get('/kardex', studentController.getKardex);

router.get('/schedule', studentController.getSchedule);

router.get('/performance', studentController.getPerformance);

router.get('/evaluations', studentController.getEvaluations);

module.exports = router;
