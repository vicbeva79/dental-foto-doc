"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessionController_1 = require("../controllers/sessionController");
const router = (0, express_1.Router)();
const sessionController = new sessionController_1.SessionController();
// Crear una nueva sesión de paciente
router.post('/', sessionController.createSession);
exports.default = router;
