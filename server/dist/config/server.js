"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverConfig = void 0;
exports.serverConfig = {
    port: process.env.PORT || 3000,
    uploadDir: process.env.UPLOAD_DIR || 'uploads'
};
