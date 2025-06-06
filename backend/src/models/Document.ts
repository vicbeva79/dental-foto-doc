import mysql from 'mysql2/promise';

// Configuración de la conexión
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dental_photo_doc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Interfaz para el documento
export interface Document {
  id?: number;
  nombre: string;
  ficha: string;
  doctor: string;
  fecha: string;
  fotos: {
    etiqueta: string;
    imagen: string;
  }[];
  created_at?: Date;
  updated_at?: Date;
}

// Funciones para interactuar con la base de datos
export const DocumentModel = {
  // Crear un nuevo documento
  async create(document: Document): Promise<Document> {
    const [result] = await pool.execute(
      'INSERT INTO documents (nombre, ficha, doctor, fecha, fotos) VALUES (?, ?, ?, ?, ?)',
      [document.nombre, document.ficha, document.doctor, document.fecha, JSON.stringify(document.fotos)]
    );
    return { ...document, id: (result as any).insertId };
  },

  // Obtener todos los documentos
  async findAll(): Promise<Document[]> {
    const [rows] = await pool.execute('SELECT * FROM documents ORDER BY created_at DESC');
    return (rows as Document[]).map(doc => ({
      ...doc,
      fotos: JSON.parse(doc.fotos as unknown as string)
    }));
  },

  // Obtener un documento por ID
  async findById(id: number): Promise<Document | null> {
    const [rows] = await pool.execute('SELECT * FROM documents WHERE id = ?', [id]);
    const documents = rows as Document[];
    if (documents.length === 0) return null;
    return {
      ...documents[0],
      fotos: JSON.parse(documents[0].fotos as unknown as string)
    };
  },

  // Actualizar un documento
  async update(id: number, document: Document): Promise<Document | null> {
    const [result] = await pool.execute(
      'UPDATE documents SET nombre = ?, ficha = ?, doctor = ?, fecha = ?, fotos = ?, updated_at = NOW() WHERE id = ?',
      [document.nombre, document.ficha, document.doctor, document.fecha, JSON.stringify(document.fotos), id]
    );
    if ((result as any).affectedRows === 0) return null;
    return { ...document, id };
  },

  // Eliminar un documento
  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM documents WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }
}; 