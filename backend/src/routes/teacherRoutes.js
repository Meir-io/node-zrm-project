const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getTeacherGroups,
  getGroupStudents,
  updateGrades,
  updateGradesBatch,
  getTeacherSchedule,
  getEvaluations,
  createEvaluation
} = require('../controllers/teacherController');

router.use(verifyToken);
router.use(authorizeRoles('TEACHER'));

router.get('/groups', getTeacherGroups);

router.get('/groups/:id/students', getGroupStudents);

router.put('/grades', updateGrades);

router.put('/grades/batch', updateGradesBatch);

router.get('/schedule', getTeacherSchedule);

router.get('/evaluations', getEvaluations);

router.post('/evaluations', createEvaluation);

module.exports = router;
