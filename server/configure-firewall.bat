@echo off
echo Configurando firewall para Dental Photo Doc...

netsh advfirewall firewall add rule name="Dental Photo Doc" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Dental Photo Doc" dir=out action=allow protocol=TCP localport=3000
 
echo Firewall configurado correctamente.
pause 