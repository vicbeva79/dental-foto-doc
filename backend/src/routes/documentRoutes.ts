import { Router } from 'express';
import * as documentController from '../controllers/documentController';

const router = Router();

// Rutas para documentos
router.post('/', documentController.create);
router.get('/', documentController.list);
router.get('/:id', documentController.get);
router.put('/:id', documentController.update);
router.delete('/:id', documentController.remove);

export default router; 