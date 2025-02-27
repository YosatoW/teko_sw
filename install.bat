@echo off
echo Starte Bun-Installation...

bun install
bun update

bun add drizzle-orm pg dotenv
bun add -D drizzle-kit tsx @types/pg

bun install --cwd ./frontend
bun update --cwd ./frontend

echo Fertig!
pause
