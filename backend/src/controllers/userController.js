
const db = require('../config/db');
const bcryptjs = require('bcryptjs');

exports.getProfile = async (req, res, next) => {
    try {
        const query = `
            SELECT u.id, u.first_name, u.last_name, u.email, r.name AS role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1`;
        const result = await db.query(query, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { first_name, last_name, password } = req.body;
        let updateQuery = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
        let params = [];
        let paramIndex = 1;

        if (first_name) {
            updateQuery += `, first_name = $${paramIndex++}`;
            params.push(first_name);
        }
        if (last_name) {
            updateQuery += `, last_name = $${paramIndex++}`;
            params.push(last_name);
        }
        if (password) {
            const hashedPassword = await bcryptjs.hash(password, 10);
            updateQuery += `, password_hash = $${paramIndex++}`;
            params.push(hashedPassword);
        }

        updateQuery += ` WHERE id = $${paramIndex} RETURNING id, first_name, last_name, email`;
        params.push(req.user.id);

        const result = await db.query(updateQuery, params);
        res.status(200).json({ message: 'Profile updated successfully', user: result.rows[0] });
    } catch (error) {
        next(error);
    }
};