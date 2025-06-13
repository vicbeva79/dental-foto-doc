"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoController = void 0;
const photoService_1 = require("../services/photoService");
const promises_1 = __importDefault(require("fs/promises"));
class PhotoController {
    constructor() {
        this.addPhoto = async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ error: 'No se ha proporcionado ninguna foto' });
                }
                const { sessionId } = req.params;
                const { type } = req.body;
                if (!type) {
                    return res.status(400).json({ error: 'El tipo de foto es requerido' });
                }
                const photo = await this.photoService.addPhoto({
                    sessionId,
                    type,
                    url: req.file.path,
                });
                res.status(201).json(photo);
            }
            catch (error) {
                console.error('Error al agregar foto:', error);
                res.status(500).json({ error: 'Error al agregar la foto' });
            }
        };
        this.getPhotosBySessionId = async (req, res) => {
            try {
                const { sessionId } = req.params;
                const photos = await this.photoService.getPhotosBySessionId(sessionId);
                res.json(photos);
            }
            catch (error) {
                console.error('Error al obtener fotos:', error);
                res.status(500).json({ error: 'Error al obtener las fotos' });
            }
        };
        this.deletePhoto = async (req, res) => {
            try {
                const { photoId } = req.params;
                const photo = await this.photoService.getPhotoById(photoId);
                if (!photo) {
                    return res.status(404).json({ error: 'Foto no encontrada' });
                }
                // Eliminar el archivo físico
                try {
                    await promises_1.default.unlink(photo.url);
                }
                catch (error) {
                    console.error('Error al eliminar archivo físico:', error);
                }
                await this.photoService.deletePhoto(photoId);
                res.status(204).send();
            }
            catch (error) {
                console.error('Error al eliminar foto:', error);
                res.status(500).json({ error: 'Error al eliminar la foto' });
            }
        };
        this.photoService = new photoService_1.PhotoService();
    }
}
exports.PhotoController = PhotoController;
