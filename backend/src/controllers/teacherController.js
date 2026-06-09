const db = require('../config/db');

const getTeacherGroups = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const query = `
      SELECT g.id, g.name, g.room, g.schedule, s.name as subject_name, s.color as subject_color
      FROM groups g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.teacher_id = $1
    `;
    const result = await db.query(query, [teacherId]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getGroupStudents = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const teacherId = req.user.id;

    const groupCheck = await db.query('SELECT id FROM groups WHERE id = $1 AND teacher_id = $2', [groupId, teacherId]);
    if (groupCheck.rows.length === 0) {
      return res.status(403).json({ message: "Forbidden: You do not have access to this group." });
    }

    const query = `
      SELECT
          e.id AS enrollment_id,
          e.status,
          u.id AS student_id,
          u.first_name,
          u.last_name,
          u.email,
          g.p1,
          g.p2,
          g.p3,
          g.final,
          g.average,
          COALESCE((SELECT SUM(present)*100.0/NULLIF(SUM(total), 0) FROM attendance_history WHERE enrollment_id = e.id), 0)::int as attendance,
          (SELECT json_agg(json_build_object('month', month, 'present', present, 'total', total)) FROM attendance_history WHERE enrollment_id = e.id) as attendance_history
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      LEFT JOIN grades g ON e.id = g.enrollment_id
      WHERE e.group_id = $1
      ORDER BY u.last_name, u.first_name
    `;
    const result = await db.query(query, [groupId]);

    const students = result.rows.map(s => ({
        ...s,
        attendance_history: s.attendance_history || []
    }));

    res.json(students);
  } catch (error) {
    next(error);
  }
};

const updateGrades = async (req, res, next) => {
  try {
    const { enrollment_id, p1, p2, p3, final } = req.body;
    const teacherId = req.user.id;

    if (!enrollment_id) {
      return res.status(400).json({ message: "enrollment_id is required" });
    }

    const checkQuery = `
      SELECT g.teacher_id
      FROM enrollments e
      JOIN groups g ON e.group_id = g.id
      WHERE e.id = $1
    `;
    const checkRes = await db.query(checkQuery, [enrollment_id]);
    if (checkRes.rows.length === 0 || checkRes.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ message: "Forbidden: You cannot modify grades for this enrollment." });
    }

    let sum = 0;
    let count = 0;
    const parseP1 = p1 != null ? parseFloat(p1) : null;
    const parseP2 = p2 != null ? parseFloat(p2) : null;
    const parseP3 = p3 != null ? parseFloat(p3) : null;
    const parseFinal = final != null ? parseFloat(final) : null;

    if (parseP1 != null) { sum += parseP1; count++; }
    if (parseP2 != null) { sum += parseP2; count++; }
    if (parseP3 != null) { sum += parseP3; count++; }

    let average = null;
    if (count > 0) {
      average = (sum / count).toFixed(2);
    }

    const query = `
      INSERT INTO grades (enrollment_id, p1, p2, p3, final, average)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (enrollment_id) DO UPDATE
      SET p1 = EXCLUDED.p1,
          p2 = EXCLUDED.p2,
          p3 = EXCLUDED.p3,
          final = EXCLUDED.final,
          average = EXCLUDED.average
      RETURNING *;
    `;
    const result = await db.query(query, [enrollment_id, parseP1, parseP2, parseP3, parseFinal, average]);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// GET /api/teacher/schedule
const getTeacherSchedule = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const query = `
      SELECT g.id as group_id, g.name as group_name, g.room, g.schedule, s.name as subject_name
      FROM groups g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.teacher_id = $1
    `;
    const result = await db.query(query, [teacherId]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getEvaluations = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const query = `
      SELECT
          ev.id,
          ev.title as name,
          ev.type,
          to_char(ev.due_date, 'YYYY-MM-DD') as date,
          ev.urgency,
          g.name as group
      FROM evaluations ev
      JOIN groups g ON ev.group_id = g.id
      WHERE g.teacher_id = $1
      ORDER BY ev.due_date ASC
    `;
    const result = await db.query(query, [teacherId]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const createEvaluation = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { group_id, title, type, due_date, urgency } = req.body;

    const groupCheck = await db.query('SELECT id FROM groups WHERE id = $1 AND teacher_id = $2', [group_id, teacherId]);
    if (groupCheck.rows.length === 0) {
      return res.status(403).json({ message: "Forbidden: Not your group." });
    }

    const query = `
      INSERT INTO evaluations (group_id, title, type, due_date, urgency)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await db.query(query, [group_id, title, type, due_date, urgency]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateGradesBatch = async (req, res, next) => {
  try {
    const { grades } = req.body;
    const teacherId = req.user.id;

    if (!Array.isArray(grades)) {
      return res.status(400).json({ message: "grades must be an array" });
    }

    await db.query('BEGIN');

    for (const g of grades) {
      const { enrollment_id, p1, p2, p3, final } = g;

      let sum = 0; let count = 0;
      const parseP1 = p1 != null && p1 !== '' ? parseFloat(p1) : null;
      const parseP2 = p2 != null && p2 !== '' ? parseFloat(p2) : null;
      const parseP3 = p3 != null && p3 !== '' ? parseFloat(p3) : null;
      const parseFinal = final != null && final !== '' ? parseFloat(final) : null;

      if (parseP1 != null) { sum += parseP1; count++; }
      if (parseP2 != null) { sum += parseP2; count++; }
      if (parseP3 != null) { sum += parseP3; count++; }

      let average = null;
      if (count > 0) {
        average = (sum / count).toFixed(2);
      }

      const updateQuery = `
        INSERT INTO grades (enrollment_id, p1, p2, p3, final, average)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (enrollment_id) DO UPDATE
        SET p1 = EXCLUDED.p1, p2 = EXCLUDED.p2, p3 = EXCLUDED.p3,
            final = EXCLUDED.final, average = EXCLUDED.average
      `;
      await db.query(updateQuery, [enrollment_id, parseP1, parseP2, parseP3, parseFinal, average]);
    }

    await db.query('COMMIT');
    res.json({ message: "Grades updated successfully" });
  } catch (error) {
    await db.query('ROLLBACK');
    next(error);
  }
};

module.exports = {
  getTeacherGroups,
  getGroupStudents,
  updateGrades,
  updateGradesBatch,
  getTeacherSchedule,
  getEvaluations,
  createEvaluation
};
