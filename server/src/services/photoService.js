"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoService = void 0;
const database_1 = require("../config/database");
const uuid_1 = require("uuid");
class PhotoService {
    async addPhoto(data) {
        const connection = await database_1.pool.getConnection();
        try {
            const photo = {
                id: (0, uuid_1.v4)(),
                sessionId: data.sessionId,
                type: data.type,
                url: data.url,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await connection.query('INSERT INTO photos (id, sessionId, type, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)', [photo.id, photo.sessionId, photo.type, photo.url, photo.createdAt, photo.updatedAt]);
            return photo;
        }
        finally {
            connection.release();
        }
    }
    async getPhotosBySessionId(sessionId) {
        const connection = await database_1.pool.getConnection();
        try {
            const [rows] = await connection.query('SELECT * FROM photos WHERE sessionId = ? ORDER BY createdAt DESC', [sessionId]);
            return rows;
        }
        finally {
            connection.release();
        }
    }
    async getPhotoById(photoId) {
        const connection = await database_1.pool.getConnection();
        try {
            const [rows] = await connection.query('SELECT * FROM photos WHERE id = ?', [photoId]);
            return rows[0] || null;
        }
        finally {
            connection.release();
        }
    }
    async deletePhoto(photoId) {
        const connection = await database_1.pool.getConnection();
        try {
            await connection.query('DELETE FROM photos WHERE id = ?', [photoId]);
        }
        finally {
            connection.release();
        }
    }
}
exports.PhotoService = PhotoService;
