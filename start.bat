@echo off
REM Start Docker
docker compose up -d
timeout /t 2

REM Start Backend in new terminal
start /min "Backend" cmd /k "bun run --watch src/app.ts"
timeout /t 2

REM Start Drizzle in new terminal
start /min "Drizzle" cmd /k "bunx drizzle-kit push && bunx drizzle-kit studio"
timeout /t 2

REM Start Frontend in new terminal
start /min "Frontend" cmd /k "cd frontend && bun run dev"