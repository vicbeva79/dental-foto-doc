import { pool } from '../config/database';
import { Photo } from '../types/photo';
import { v4 as uuidv4 } from 'uuid';

export class PhotoService {
  async addPhoto(data: { sessionId: string; type: string; url: string }): Promise<Photo> {
    const connection = await pool.getConnection();
    try {
      const photo = {
        id: uuidv4(),
        sessionId: data.sessionId,
        type: data.type,
        url: data.url,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await connection.query(
        'INSERT INTO photos (id, sessionId, type, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [photo.id, photo.sessionId, photo.type, photo.url, photo.createdAt, photo.updatedAt]
      );

      return photo as Photo;
    } finally {
      connection.release();
    }
  }

  async getPhotosBySessionId(sessionId: string): Promise<Photo[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<Photo[]>(
        'SELECT * FROM photos WHERE sessionId = ? ORDER BY createdAt DESC',
        [sessionId]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  async getPhotoById(photoId: string): Promise<Photo | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<Photo[]>(
        'SELECT * FROM photos WHERE id = ?',
        [photoId]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async deletePhoto(photoId: string): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.query('DELETE FROM photos WHERE id = ?', [photoId]);
    } finally {
      connection.release();
    }
  }
} 