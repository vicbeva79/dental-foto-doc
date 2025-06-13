import multer from 'multer';
import path from 'path';
import { fileConfig } from '../config/env';

// Configurar el almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileConfig.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Configurar el filtro de archivos
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Aceptar solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

// Crear el middleware de upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: fileConfig.maxFileSize // 5MB por defecto
  }
}); 