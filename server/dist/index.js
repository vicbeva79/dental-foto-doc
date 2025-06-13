"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const photoRoutes_1 = __importDefault(require("./routes/photoRoutes"));
const sessionRoutes_1 = __importDefault(require("./routes/sessionRoutes"));
// Validar la configuración
(0, env_1.validateConfig)();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: env_1.serverConfig.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json());
// Rutas
app.use('/api/photos', photoRoutes_1.default);
app.use('/api/sessions', sessionRoutes_1.default);
// Servir archivos estáticos
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'Servidor de fotos dentales funcionando correctamente' });
});
// Configuración HTTPS
const httpsOptions = {
    key: fs_1.default.readFileSync(path_1.default.join(__dirname, '../certs/server.key')),
    cert: fs_1.default.readFileSync(path_1.default.join(__dirname, '../certs/server.crt'))
};
// Iniciar el servidor HTTPS
const host = '0.0.0.0';
const port = Number(env_1.serverConfig.port);
https_1.default.createServer(httpsOptions, app).listen(port, host, async () => {
    try {
        await (0, database_1.testConnection)();
        console.log(`Servidor HTTPS corriendo en https://localhost:${port}`);
        console.log(`Accesible desde la red local en: https://192.168.1.208:${port}`);
    }
    catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
});
