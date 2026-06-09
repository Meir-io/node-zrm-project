
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, role } = req.body;

        if (!first_name || !last_name || !email || !password || !role) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }
        const roleResult = await db.query('SELECT id FROM roles WHERE name = $1', [role.toUpperCase()]);
        if (roleResult.rows.length === 0) {
            return res.status(400).json({ message: 'El rol solicitado es inválido' });
        }
        const roleId = roleResult.rows[0].id;
        const hashedPassword = await bcryptjs.hash(password, 10);
        const query = `
            INSERT INTO users (first_name, last_name, email, password_hash, role_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, first_name, last_name, email`;
        const result = await db.query(query, [first_name, last_name, email, hashedPassword, roleId]);
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'El correo y la contraseña son obligatorios' });
        }

        const query = `
            SELECT u.*, r.name AS role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1`;
        const result = await db.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcryptjs.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role_name },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: { id: user.id, name: `${user.first_name} ${user.last_name}`, email: user.email, role: user.role_name }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
};