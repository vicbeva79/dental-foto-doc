import express from 'express';
import cors from 'cors';
import path from 'path';
import { serverConfig, validateConfig } from './config/env';
import { testConnection } from './config/database';
import photoRoutes from './routes/photoRoutes';
import sessionRoutes from './routes/sessionRoutes';

// Validar la configuración
validateConfig();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Permitir acceso desde cualquier origen en la red local
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rutas
app.use('/api/photos', photoRoutes);
app.use('/api/sessions', sessionRoutes);

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Servidor de fotos dentales funcionando correctamente' });
});

// Iniciar el servidor
const host = '0.0.0.0'; // Escuchar en todas las interfaces de red
const port = Number(serverConfig.port); // Asegurar que el puerto sea un número
app.listen(port, host, async () => {
  try {
    await testConnection();
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log(`Accesible desde la red local en: http://[IP-DEL-SERVIDOR]:${port}`);
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}); 