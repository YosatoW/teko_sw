# TEKO: Software und Plattform Architektur

To install dependencies:

```bash


bun install
bun update

bun install ./frontend
bun update ./frontend

bun add drizzle-orm pg dotenv
bun add -D drizzle-kit tsx @types/pg

docker compose build
```

To run:
Starte den Programm "Docker Desktop"

```bash
./start.bat
```
To run:

```bash
./stop.bat
```

This project was created using `bun init` in bun v1.1.38. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
