@echo off
echo Starte Bun-Installation...

bun install
bun update

bun install --cwd ./frontend
bun update --cwd ./frontend

echo Fertig!
pause
