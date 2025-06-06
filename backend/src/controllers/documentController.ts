import { Request, Response } from 'express';
import { DocumentModel, Document } from '../models/Document';

// Crear un nuevo documento
export const create = async (req: Request, res: Response) => {
  try {
    const document = await DocumentModel.create(req.body as Document);
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el documento', error });
  }
};

// Obtener todos los documentos
export const list = async (req: Request, res: Response) => {
  try {
    const documents = await DocumentModel.findAll();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los documentos', error });
  }
};

// Obtener un documento específico
export const get = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const document = await DocumentModel.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el documento', error });
  }
};

// Actualizar un documento
export const update = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const document = await DocumentModel.update(id, req.body as Document);
    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    res.json(document);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el documento', error });
  }
};

// Eliminar un documento
export const remove = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await DocumentModel.delete(id);
    if (!success) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el documento', error });
  }
}; 