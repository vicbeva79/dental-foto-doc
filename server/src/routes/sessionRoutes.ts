import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';

const router = Router();
const sessionController = new SessionController();

// Crear una nueva sesión de paciente
router.post('/', sessionController.createSession);

export default router; 