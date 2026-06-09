const db = require('../config/db');

const getDashboard = async (req, res, next) => {
    try {
        const studentId = req.user.id;

        const query = `
            SELECT
                g.id as group_id,
                g.name as group_name,
                s.name as subject_name,
                s.credits,
                s.color,
                gr.p1, gr.p2, gr.p3, gr.final, gr.average
            FROM enrollments e
            JOIN groups g ON e.group_id = g.id
            JOIN subjects s ON g.subject_id = s.id
            LEFT JOIN grades gr ON gr.enrollment_id = e.id
            WHERE e.student_id = $1 AND e.status = 'Cursando'
        `;

        const { rows } = await db.query(query, [studentId]);
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

const getKardex = async (req, res, next) => {
    try {
        const studentId = req.user.id;

        const query = `
            SELECT
                e.semester,
                g.id as group_id,
                g.name as group_name,
                s.name as subject_name,
                s.credits,
                gr.average,
                e.status
            FROM enrollments e
            JOIN groups g ON e.group_id = g.id
            JOIN subjects s ON g.subject_id = s.id
            LEFT JOIN grades gr ON gr.enrollment_id = e.id
            WHERE e.student_id = $1
            ORDER BY e.semester DESC, s.name ASC
        `;

        const { rows } = await db.query(query, [studentId]);

        const kardex = rows.reduce((acc, row) => {
            const semester = row.semester || 'Other';
            if (!acc[semester]) {
                acc[semester] = [];
            }
            acc[semester].push(row);
            return acc;
        }, {});

        res.json(kardex);
    } catch (error) {
        next(error);
    }
};

const getSchedule = async (req, res, next) => {
    try {
        const studentId = req.user.id;

        const query = `
            SELECT
                g.id as group_id,
                g.name as group_name,
                s.name as subject_name,
                s.color,
                g.room,
                g.schedule,
                u.first_name as teacher_first_name,
                u.last_name as teacher_last_name
            FROM enrollments e
            JOIN groups g ON e.group_id = g.id
            JOIN subjects s ON g.subject_id = s.id
            LEFT JOIN users u ON g.teacher_id = u.id
            WHERE e.student_id = $1 AND e.status = 'Cursando'
        `;

        const { rows } = await db.query(query, [studentId]);
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

const getPerformance = async (req, res, next) => {
    try {
        const studentId = req.user.id;

        const query = `
            SELECT
                COUNT(e.id)::int AS total_subjects,
                COALESCE(SUM(s.credits), 0)::int AS total_credits,
                COALESCE(AVG(gr.average), 0)::numeric(5,2) AS general_average,
                COALESCE(SUM(CASE WHEN e.status = 'Aprobado' OR gr.average >= 70 THEN s.credits ELSE 0 END), 0)::int AS accumulated_credits
            FROM enrollments e
            JOIN groups g ON e.group_id = g.id
            JOIN subjects s ON g.subject_id = s.id
            LEFT JOIN grades gr ON gr.enrollment_id = e.id
            WHERE e.student_id = $1
        `;

        const { rows } = await db.query(query, [studentId]);

        res.json(rows[0] || {
            total_subjects: 0,
            total_credits: 0,
            general_average: 0,
            accumulated_credits: 0
        });
    } catch (error) {
        next(error);
    }
};

const getEvaluations = async (req, res, next) => {
    try {
        const studentId = req.user.id;

        const query = `
            SELECT
                ev.id,
                ev.title as subject,
                ev.type,
                to_char(ev.due_date, 'YYYY-MM-DD') as date,
                ev.urgency,
                g.room,
                s.name as subject_name
            FROM enrollments e
            JOIN groups g ON e.group_id = g.id
            JOIN subjects s ON g.subject_id = s.id
            JOIN evaluations ev ON ev.group_id = g.id
            WHERE e.student_id = $1 AND e.status = 'Cursando'
            ORDER BY ev.due_date ASC
        `;

        const { rows } = await db.query(query, [studentId]);

        const formatted = rows.map(r => ({
            id: r.id,
            subject: r.subject_name,
            type: r.type,
            date: r.date,
            room: r.room,
            time: '10:00 - 12:00'
        }));

        res.json(formatted);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboard,
    getKardex,
    getSchedule,
    getPerformance,
    getEvaluations
};
