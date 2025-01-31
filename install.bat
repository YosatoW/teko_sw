install.bat
@echo off
echo Starte Bun-Installation...
bun init -y

bun install
bun update

bun add drizzle-orm pg dotenv
bun add -D drizzle-kit tsx @types/pg

bun install --cwd ./frontend
bun update --cwd ./frontend

echo Fertig!
pause



.env
DATABASE_URL=postgressql://postgres:supersecret123@localhost:5432/minitwitter
JWT_SECRET=thesupersecretjwtsecret