import { Request, Response } from 'express';
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class SessionController {
  async createSession(req: Request, res: Response) {
    const connection = await pool.getConnection();
    try {
      const { name, lastName, fileNumber, doctor } = req.body;
      
      if (!name || !lastName || !fileNumber || !doctor) {
        return res.status(400).json({ 
          error: 'Todos los campos son requeridos' 
        });
      }

      const session = {
        id: uuidv4(),
        name,
        lastName,
        fileNumber,
        doctor,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await connection.query(
        'INSERT INTO sessions (id, name, lastName, fileNumber, doctor, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [session.id, session.name, session.lastName, session.fileNumber, session.doctor, session.createdAt, session.updatedAt]
      );

      res.status(201).json(session);
    } catch (error) {
      console.error('Error al crear sesión:', error);
      res.status(500).json({ error: 'Error al crear la sesión' });
    } finally {
      connection.release();
    }
  }
} 