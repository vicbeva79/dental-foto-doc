import { Request, Response } from 'express';
import { PhotoService } from '../services/photoService';
import { upload } from '../middleware/upload';
import path from 'path';
import fs from 'fs/promises';

export class PhotoController {
  private photoService: PhotoService;

  constructor() {
    this.photoService = new PhotoService();
  }

  addPhoto = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ninguna foto' });
      }

      const { sessionId } = req.params;
      const { type } = req.body;

      if (!type) {
        return res.status(400).json({ error: 'El tipo de foto es requerido' });
      }

      const photo = await this.photoService.addPhoto({
        sessionId,
        type,
        url: req.file.path,
      });

      res.status(201).json(photo);
    } catch (error) {
      console.error('Error al agregar foto:', error);
      res.status(500).json({ error: 'Error al agregar la foto' });
    }
  };

  getPhotosBySessionId = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const photos = await this.photoService.getPhotosBySessionId(sessionId);
      res.json(photos);
    } catch (error) {
      console.error('Error al obtener fotos:', error);
      res.status(500).json({ error: 'Error al obtener las fotos' });
    }
  };

  deletePhoto = async (req: Request, res: Response) => {
    try {
      const { photoId } = req.params;
      const photo = await this.photoService.getPhotoById(photoId);

      if (!photo) {
        return res.status(404).json({ error: 'Foto no encontrada' });
      }

      // Eliminar el archivo físico
      try {
        await fs.unlink(photo.url);
      } catch (error) {
        console.error('Error al eliminar archivo físico:', error);
      }

      await this.photoService.deletePhoto(photoId);
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      res.status(500).json({ error: 'Error al eliminar la foto' });
    }
  };
} 