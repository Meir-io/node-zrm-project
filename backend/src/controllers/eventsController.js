
const db = require('../config/db');

exports.getEvents = async (req, res, next) => {
    try {
        const userRole = req.user.role;

        const query = `
            SELECT e.id, e.title, e.description, e.type, e.target_role, e.created_at, u.first_name, u.last_name, r.name AS author_role
            FROM events e
            JOIN users u ON e.author_id = u.id
            JOIN roles r ON u.role_id = r.id
            WHERE e.target_role = 'ALL' OR e.target_role = $1
            ORDER BY e.created_at DESC
        `;

        const result = await db.query(query, [userRole]);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};
