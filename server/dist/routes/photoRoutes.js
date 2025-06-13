"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const photoController_1 = require("../controllers/photoController");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
const photoController = new photoController_1.PhotoController();
// Agregar una foto a una sesión
router.post('/:sessionId', upload_1.upload.single('photo'), photoController.addPhoto);
// Obtener todas las fotos de una sesión
router.get('/session/:sessionId', photoController.getPhotosBySessionId);
// Eliminar una foto
router.delete('/:photoId', photoController.deletePhoto);
exports.default = router;
