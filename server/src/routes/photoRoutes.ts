import { Router } from 'express';
import { PhotoController } from '../controllers/photoController';
import { upload } from '../middleware/upload';

const router = Router();
const photoController = new PhotoController();

// Agregar una foto a una sesión
router.post('/:sessionId', upload.single('photo'), photoController.addPhoto);

// Obtener todas las fotos de una sesión
router.get('/session/:sessionId', photoController.getPhotosBySessionId);

// Eliminar una foto
router.delete('/:photoId', photoController.deletePhoto);

export default router; 