const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/photos';
const TEST_SESSION = `test-session-${Date.now()}`;

async function testEndpoints() {
    try {
        console.log('🧪 Iniciando pruebas...\n');

        // 1. Prueba de subida de foto
        console.log('1️⃣ Probando subida de foto...');
        const formData = new FormData();
        const testImagePath = path.join(__dirname, 'test-image.jpg');
        
        // Verificar si existe la imagen de prueba
        if (!fs.existsSync(testImagePath)) {
            console.error('❌ No se encontró la imagen de prueba en:', testImagePath);
            return;
        }

        formData.append('photo', fs.createReadStream(testImagePath));
        formData.append('type', 'frontal');

        const uploadResponse = await fetch(`${BASE_URL}/${TEST_SESSION}`, {
            method: 'POST',
            body: formData
        });

        const uploadResult = await uploadResponse.json();
        console.log('📤 Resultado de subida:', uploadResult);

        if (!uploadResponse.ok) {
            throw new Error(`Error en subida: ${uploadResult.message}`);
        }

        // 2. Prueba de obtención de fotos
        console.log('\n2️⃣ Probando obtención de fotos...');
        const getResponse = await fetch(`${BASE_URL}/session/${TEST_SESSION}`);
        const getResult = await getResponse.json();
        console.log('📥 Fotos obtenidas:', getResult);

        if (!getResponse.ok) {
            throw new Error(`Error al obtener fotos: ${getResult.message}`);
        }

        // 3. Prueba de eliminación de foto
        if (getResult.photos && getResult.photos.length > 0) {
            console.log('\n3️⃣ Probando eliminación de foto...');
            const photoToDelete = getResult.photos[0];
            const deleteResponse = await fetch(`${BASE_URL}/${TEST_SESSION}/${photoToDelete.id}`, {
                method: 'DELETE'
            });
            const deleteResult = await deleteResponse.json();
            console.log('🗑️ Resultado de eliminación:', deleteResult);

            if (!deleteResponse.ok) {
                throw new Error(`Error al eliminar foto: ${deleteResult.message}`);
            }
        }

        console.log('\n✅ Todas las pruebas completadas exitosamente!');
    } catch (error) {
        console.error('\n❌ Error durante las pruebas:', error.message);
    }
}

testEndpoints(); 