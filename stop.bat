@echo off
@REM echo Warning: This will close all CMD windows
@REM echo Press Ctrl+C to cancel or...
@REM pause


echo Closing specific windows...
taskkill /F /FI "WINDOWTITLE eq Frontend*" /T
taskkill /F /FI "WINDOWTITLE eq Drizzle*" /T
taskkill /F /FI "WINDOWTITLE eq Backend*" /T
timeout /t 1


REM Start Docker
docker compose down
timeout /t 1