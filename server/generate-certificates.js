const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Crear directorio de certificados si no existe
const certsDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

// Generar certificado autofirmado
const command = `openssl req -x509 -newkey rsa:2048 -keyout ${path.join(certsDir, 'key.pem')} -out ${path.join(certsDir, 'cert.pem')} -days 365 -nodes -subj "/CN=localhost"`;

try {
  execSync(command);
  console.log('Certificados generados correctamente en:', certsDir);
} catch (error) {
  console.error('Error al generar los certificados:', error);
} 