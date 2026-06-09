
const db = require('../config/db');
const bcryptjs = require('bcryptjs');

exports.getUsers = async (req, res, next) => {
    try {
        const query = `
            SELECT u.id, u.first_name, u.last_name, u.email, u.status, u.created_at, r.name AS role
            FROM users u
            JOIN roles r ON u.role_id = r.id
        `;
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

exports.createUser = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, role, status } = req.body;

        const roleResult = await db.query('SELECT id FROM roles WHERE name = $1', [role.toUpperCase()]);
        if (roleResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const roleId = roleResult.rows[0].id;
        const hashedPassword = await bcryptjs.hash(password, 10);

        const query = `
            INSERT INTO users (first_name, last_name, email, password_hash, role_id, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, first_name, last_name, email, status
        `;

        const result = await db.query(query, [first_name, last_name, email, hashedPassword, roleId, status || 'ACTIVE']);
        res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, name, email, role, status } = req.body;

        let fn = first_name;
        let ln = last_name;
        if (name && !first_name && !last_name) {
            const parts = name.split(' ');
            fn = parts[0];
            ln = parts.slice(1).join(' ') || '';
        }

        let updateQuery = 'UPDATE users SET ';
        const params = [];
        let paramIndex = 1;
        const updates = [];

        if (fn !== undefined) {
            updates.push(`first_name = $${paramIndex++}`);
            params.push(fn);
        }
        if (ln !== undefined) {
            updates.push(`last_name = $${paramIndex++}`);
            params.push(ln);
        }
        if (email !== undefined) {
            updates.push(`email = $${paramIndex++}`);
            params.push(email);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            params.push(status);
        }
        if (role !== undefined) {
            const roleResult = await db.query('SELECT id FROM roles WHERE name = $1', [role.toUpperCase()]);
            if (roleResult.rows.length > 0) {
                updates.push(`role_id = $${paramIndex++}`);
                params.push(roleResult.rows[0].id);
            } else {
                return res.status(400).json({ message: 'Invalid role' });
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update' });
        }

        updateQuery += updates.join(', ') + ` WHERE id = $${paramIndex} RETURNING id, first_name, last_name, email, status`;
        params.push(id);

        const result = await db.query(updateQuery, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const studentsResult = await db.query(`
            SELECT COUNT(*) FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'STUDENT' AND u.status = 'ACTIVE'
        `);

        const teachersResult = await db.query(`
            SELECT COUNT(*) FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'TEACHER' AND u.status = 'ACTIVE'
        `);

        const subjectsResult = await db.query(`
            SELECT COUNT(*) FROM subjects
        `);

        res.status(200).json({
            students: parseInt(studentsResult.rows[0].count, 10),
            teachers: parseInt(teachersResult.rows[0].count, 10),
            subjects: parseInt(subjectsResult.rows[0].count, 10)
        });
    } catch (error) {
        next(error);
    }
};

exports.createEvent = async (req, res, next) => {
    try {
        const { title, description, type, target_role } = req.body;
        const author_id = req.user.id;

        if (!title || !description) {
            return res.status(400).json({ message: 'El título y la descripción son obligatorios' });
        }

        const query = `
            INSERT INTO events (author_id, title, description, type, target_role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const result = await db.query(query, [
            author_id,
            title,
            description,
            type || 'Institución',
            target_role || 'ALL'
        ]);

        res.status(201).json({ message: 'Evento creado exitosamente', event: result.rows[0] });
    } catch (error) {
        next(error);
    }
};
