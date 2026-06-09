const fs = require('fs');
const path = require('path');
const bcryptjs = require('bcryptjs');
const db = require('./src/config/db');
require('dotenv').config();

async function initDB() {
    try {
        console.log('⏳ Iniciando la creación de la base de datos...');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await db.query(schema);
        console.log('✅ Tablas creadas correctamente.');

        await db.query(`INSERT INTO roles (name) VALUES ('ADMIN'), ('TEACHER'), ('STUDENT') ON CONFLICT DO NOTHING`);
        console.log('✅ Roles insertados.');

        const passwordHash = await bcryptjs.hash('123456', 10);

        console.log('⏳ Insertando usuarios...');
        const users = [
            { first: 'Admin', last: 'Principal', email: 'admin@zrm.edu', role: 1 },
            { first: 'María', last: 'González', email: 'teacher@zrm.edu', role: 2 },
            { first: 'Carlos', last: 'Pérez', email: 'student@zrm.edu', role: 3 },
            { first: 'Ana', last: 'López', email: 'student2@zrm.edu', role: 3 }
        ];

        for (const u of users) {
            await db.query(
                `INSERT INTO users (first_name, last_name, email, password_hash, role_id)
                 VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
                [u.first, u.last, u.email, passwordHash, u.role]
            );
        }

        const adminId = (await db.query(`SELECT id FROM users WHERE email='admin@zrm.edu'`)).rows[0].id;
        const teacherId = (await db.query(`SELECT id FROM users WHERE email='teacher@zrm.edu'`)).rows[0].id;
        const student1Id = (await db.query(`SELECT id FROM users WHERE email='student@zrm.edu'`)).rows[0].id;
        const student2Id = (await db.query(`SELECT id FROM users WHERE email='student2@zrm.edu'`)).rows[0].id;

        console.log('⏳ Insertando materias...');
        await db.query(`
            INSERT INTO subjects (name, credits, description, color) VALUES
            ('Programación Avanzada', 8, 'POO, Patrones y Estructuras de datos', 'blue'),
            ('Bases de Datos', 8, 'Diseño relacional y NoSQL', 'violet'),
            ('Desarrollo Web', 6, 'Frontend y Backend moderno', 'emerald')
        `);

        console.log('⏳ Insertando grupos...');
        await db.query(`
            INSERT INTO groups (subject_id, teacher_id, name, room, schedule) VALUES
            (1, $1, 'Grupo A', 'Aula 301', 'Lun & Mié 10:00–12:00'),
            (2, $1, 'Grupo B', 'Lab 105', 'Mar & Jue 14:00–16:00'),
            (3, $1, 'Grupo A', 'Lab 102', 'Lun & Mié 14:00–16:00')
        `, [teacherId]);

        console.log('⏳ Inscribiendo alumnos...');
        await db.query(`
            INSERT INTO enrollments (student_id, group_id, status, semester) VALUES
            ($1, 1, 'Cursando', 3), ($1, 2, 'Cursando', 3), ($1, 3, 'Cursando', 3),
            ($2, 1, 'Cursando', 3), ($2, 2, 'Cursando', 3)
        `, [student1Id, student2Id]);

        console.log('⏳ Creando actas de calificaciones...');
        await db.query(`
            INSERT INTO grades (enrollment_id, p1, p2, p3, final, average)
            SELECT id, 8.5, 9.0, NULL, NULL, 8.75 FROM enrollments WHERE student_id = $1 AND group_id = 1;
        `, [student1Id]);
        await db.query(`
            INSERT INTO grades (enrollment_id, p1, p2, p3, final, average)
            SELECT id, 7.0, 7.5, NULL, NULL, 7.25 FROM enrollments WHERE student_id = $1 AND group_id = 2;
        `, [student1Id]);
        await db.query(`
            INSERT INTO grades (enrollment_id, p1, p2, p3, final, average)
            SELECT id, 9.5, 9.0, NULL, NULL, 9.25 FROM enrollments WHERE student_id = $1 AND group_id = 3;
        `, [student1Id]);

        console.log('⏳ Creando avisos/eventos iniciales...');
        await db.query(`
            INSERT INTO events (author_id, title, description, type, target_role) VALUES
            ($1, 'Inicio de Semestre 2026-A', '¡Bienvenidos al nuevo semestre! Las clases inician el lunes 24.', 'Institución', 'ALL'),
            ($1, 'Mantenimiento del Sistema', 'El sistema ZRM estará en mantenimiento este sábado de 2 AM a 4 AM.', 'Sistema', 'ALL'),
            ($1, 'Periodo de Exámenes Finales', 'Se les recuerda que los exámenes finales comenzarán la segunda semana de diciembre. Favor de revisar sus calendarios.', 'Académico', 'STUDENT')
        `, [adminId]);

        console.log('⏳ Creando evaluaciones programadas...');
        await db.query(`
            INSERT INTO evaluations (group_id, title, type, due_date, urgency) VALUES
            (1, 'Examen Parcial 1', 'Examen', CURRENT_DATE + INTERVAL '5 days', 'high'),
            (1, 'Proyecto Frontend', 'Proyecto', CURRENT_DATE + INTERVAL '12 days', 'medium'),
            (2, 'Diseño de Base de Datos', 'Proyecto', CURRENT_DATE + INTERVAL '8 days', 'high'),
            (3, 'API REST', 'Quiz', CURRENT_DATE + INTERVAL '2 days', 'urgent')
        `);

        console.log('⏳ Creando historial de asistencia...');
        await db.query(`
            INSERT INTO attendance_history (enrollment_id, month, present, total)
            SELECT id, 'Ene', 18, 20 FROM enrollments WHERE semester = 3;
        `);
        await db.query(`
            INSERT INTO attendance_history (enrollment_id, month, present, total)
            SELECT id, 'Feb', FLOOR(RANDOM() * 5) + 15, 20 FROM enrollments WHERE semester = 3;
        `);

        console.log('🎉 Base de datos poblada exitosamente.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error inicializando DB:', error);
        process.exit(1);
    }
}

initDB();
