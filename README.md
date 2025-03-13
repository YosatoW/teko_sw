# TEKO: Software und Plattform Architektur

To install dependencies:

```bash

./install.bat

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

# 🐦 MiniTwitter – Ein leichtgewichtiges Social-Media-Projekt

MiniTwitter ist eine schlanke, schnelle Social-Media-Anwendung, die das Posten, Liken und Kommentieren von Beiträgen ermöglicht.  
Das Backend basiert auf **Bun**, **Express.js** und **PostgreSQL**.

---

## 🚀 **Funktionen**
- ✍️ **Beiträge erstellen** – Nutzer können kurze Nachrichten (Tweets) posten.
- ❤️ **Liken & Kommentieren** – Interagiere mit Beiträgen anderer Nutzer.
- 🔎 **Sentiment-Analyse** – Automatische Erkennung der Stimmung eines Posts.
- 🔐 **Authentifizierung** – Sichere Registrierung und Anmeldung.
- 🏎 **Hohe Performance** – Dank `Bun`, `Pino` und `Drizzle ORM`.

---

## 🛠 **Installation**

### **1️⃣ Voraussetzungen**
- 📦 **[Bun](https://bun.sh/)** (JS Runtime, Alternative zu Node.js)
- 🐘 **[PostgreSQL](https://www.postgresql.org/download/)** (Datenbank)
- 🐳 (Optional) **Docker** (Falls du die DB in einem Container nutzen willst)

### **2️⃣ Projekt klonen**
```sh
git clone <REPO-URL>
cd minitwitter

Abhängigkeit installieren
bun install

Datenbank einrichten 
docker-compose up -d

Projekt starten
./start.bat

Projekt stoppen
./stop.bat