@echo off
echo Instalando servicio Dental Photo Doc...

"C:\Program Files\nssm\nssm.exe" install "DentalPhotoDoc" "C:\Program Files\nodejs\node.exe" "C:\Program Files\xampp\htdocs\dental-photo-doc\server\dist\index.js"
"C:\Program Files\nssm\nssm.exe" set "DentalPhotoDoc" AppDirectory "C:\Program Files\xampp\htdocs\dental-photo-doc\server"
"C:\Program Files\nssm\nssm.exe" set "DentalPhotoDoc" DisplayName "Dental Photo Doc Server"
"C:\Program Files\nssm\nssm.exe" set "DentalPhotoDoc" Description "Servidor para la aplicación de documentación fotográfica dental"
"C:\Program Files\nssm\nssm.exe" set "DentalPhotoDoc" Start SERVICE_AUTO_START

echo Servicio instalado correctamente.
pause 