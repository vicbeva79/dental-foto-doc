"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
// Crear el pool de conexiones
exports.pool = promise_1.default.createPool({
    host: env_1.dbConfig.host,
    user: env_1.dbConfig.user,
    password: env_1.dbConfig.password,
    database: env_1.dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// Función para probar la conexión
async function testConnection() {
    try {
        const connection = await exports.pool.getConnection();
        console.log('Conexión a la base de datos establecida correctamente');
        connection.release();
    }
    catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        throw error;
    }
}
