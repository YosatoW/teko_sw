@echo off
echo Starte Bun-Installation...

bun install

bun add drizzle-orm pg dotenv
bun add -D drizzle-kit tsx @types/pg

bun add bycrpt
bun add -D @types/bcrypt

bun update

bun install --cwd ./frontend
bun update --cwd ./frontend

echo Fertig!
pause
