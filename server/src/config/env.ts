import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

if (process.env.NODE_ENV !== 'production') {
  console.log('Variables de entorno cargadas:', {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    PORT: process.env.PORT
  });
}

// Configuración del servidor
export const serverConfig = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// Configuración de la base de datos
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dental_photo_doc',
};

// Configuración de archivos
export const fileConfig = {
  uploadDir: path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB por defecto
};

// Función para validar la configuración
export function validateConfig() {
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME']; // DB_PASSWORD puede estar vacío
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('Variables de entorno actuales:', process.env);
    throw new Error(`Faltan las siguientes variables de entorno: ${missingVars.join(', ')}`);
  }
} 