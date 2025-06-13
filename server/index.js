const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
const os = require('os');
const mysql = require('mysql2/promise');

const app = express();
const port = 3001;

// Configurar CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json());

// Configuración de la base de datos
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dental_photo'
});

// Configurar el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    // Crear el directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Endpoint para crear una nueva sesión
app.post('/api/sessions', async (req, res) => {
  try {
    const { name, lastName, fileNumber, doctor } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO sessions (name, last_name, file_number, assigned_doctor) VALUES (?, ?, ?, ?)',
      [name, lastName, fileNumber, doctor]
    );
    
    res.json({
      id: result.insertId,
      name,
      lastName,
      fileNumber,
      doctor
    });
  } catch (error) {
    console.error('Error al crear la sesión:', error);
    res.status(500).json({ error: 'Error al crear la ficha del paciente' });
  }
});

// Endpoint para subir fotos
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const { sessionId, type } = req.body;
    const filename = req.file.filename;

    const [result] = await pool.execute(
      'INSERT INTO photos (session_id, filename, type) VALUES (?, ?, ?)',
      [sessionId, filename, type]
    );

    res.json({
      id: result.insertId,
      filename,
      type,
      sessionId
    });
  } catch (error) {
    console.error('Error al subir la foto:', error);
    res.status(500).json({ error: 'Error al subir la foto' });
  }
});

// Endpoint para obtener las fotos de una sesión
app.get('/api/photos/:sessionId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM photos WHERE session_id = ?',
      [req.params.sessionId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener las fotos:', error);
    res.status(500).json({ error: 'Error al obtener las fotos' });
  }
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../fotos-pacientes')));

// Servir la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../fotos-pacientes', 'index.html'));
});

// Obtener todas las direcciones IP disponibles
const networkInterfaces = os.networkInterfaces();
const ipAddresses = [];

Object.keys(networkInterfaces).forEach((interfaceName) => {
  networkInterfaces[interfaceName].forEach((interface) => {
    if (interface.family === 'IPv4' && !interface.internal) {
      ipAddresses.push(interface.address);
    }
  });
});

// Configurar HTTPS
const options = {
  key: fs.readFileSync(path.join(__dirname, 'certificates', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certificates', 'cert.pem'))
};

// Crear servidor HTTPS
const server = https.createServer(options, app);

// Escuchar en todas las interfaces
server.listen(port, '0.0.0.0', () => {
  console.log('\nServidor HTTPS corriendo en:');
  console.log('- Local: https://localhost:3001');
  ipAddresses.forEach(ip => {
    console.log(`- Red local: https://${ip}:3001`);
  });
}); 