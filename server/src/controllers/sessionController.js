"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const database_1 = require("../config/database");
const uuid_1 = require("uuid");
class SessionController {
    async createSession(req, res) {
        const connection = await database_1.pool.getConnection();
        try {
            const { name, lastName, fileNumber, doctor } = req.body;
            if (!name || !lastName || !fileNumber || !doctor) {
                return res.status(400).json({
                    error: 'Todos los campos son requeridos'
                });
            }

            // Limpiar los datos
            const cleanName = name.trim();
            const cleanLastName = lastName.trim();
            const cleanFileNumber = fileNumber.trim();
            const cleanDoctor = doctor.trim();

            const session = {
                id: (0, uuid_1.v4)(),
                name: cleanName,
                lastName: cleanLastName,
                fileNumber: cleanFileNumber,
                doctor: cleanDoctor,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await connection.query(
                'INSERT INTO sessions (id, name, lastName, fileNumber, doctor, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [session.id, session.name, session.lastName, session.fileNumber, session.doctor, session.createdAt, session.updatedAt]
            );

            res.status(201).json(session);
        }
        catch (error) {
            console.error('Error al crear sesión:', error);
            res.status(500).json({ 
                error: 'Error al crear la sesión',
                details: error.message 
            });
        }
        finally {
            connection.release();
        }
    }
}
exports.SessionController = SessionController;
