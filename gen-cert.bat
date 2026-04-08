@echo off
cd /d "%~dp0"
"C:\SAP\OCS-16_0\bin\openssl.exe" req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -days 365 -nodes -subj "/CN=192.168.1.12" -config "%~dp0openssl.cnf"
echo.
echo.
if exist server.crt (
    echo ========== SSL证书生成成功! ==========
    dir server.*
) else (
    echo SSL证书生成失败!
)
pause
