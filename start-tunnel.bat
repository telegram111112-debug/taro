@echo off
echo Stopping existing tunnels...
taskkill /F /IM ngrok.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting ngrok tunnel...
start /b ngrok http 5173

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Tunnel started! Getting URL...
echo ========================================
echo.

curl -s http://127.0.0.1:4040/api/tunnels | findstr "public_url"

echo.
echo ========================================
echo Copy the https URL above and use it!
echo Press any key to stop the tunnel...
echo ========================================
pause >nul

taskkill /F /IM ngrok.exe
