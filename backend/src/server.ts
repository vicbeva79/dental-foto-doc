import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import documentRoutes from './routes/documentRoutes';
import { DocumentModel } from './models/Document';

// Configuración de variables de entorno
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/documents', documentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API de Dental Photo Doc funcionando' });
});

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log('Intentando conectar a la base de datos...');
  // Probar la conexión
  DocumentModel.findAll()
    .then(() => console.log('Conexión a la base de datos exitosa'))
    .catch(error => console.error('Error conectando a la base de datos:', error));
}); 