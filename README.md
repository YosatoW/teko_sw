<div align="center">

# 🐦 𝕄𝕚𝕟𝕚𝕋𝕨𝕚𝕥𝕥𝕖𝕣

<p align="center">
  <strong>A lightweight, modern social media platform built with cutting-edge technologies</strong>
</p>

[![Built with Bun](https://img.shields.io/badge/Built%20with-Bun-black)](https://bun.sh)
[![Framework](https://img.shields.io/badge/Framework-Nuxt%203-00DC82)](https://nuxt.com)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-316192)](https://www.postgresql.org)

</div>

## ✨ Features

- 📝 **Create Posts** - Share your thoughts in short messages
- ❤️ **Engage** - Like and comment on other users' posts
- 🎭 **Sentiment Analysis** - Automatic mood detection for posts
- 🔒 **Secure Auth** - Safe registration and login system
- ⚡ **High Performance** - Powered by Bun, Pino, and Drizzle ORM

## 🚀 Tech Stack

- 🎨 **Frontend**: [Nuxt 3](https://nuxt.com) + [TailwindCSS](https://tailwindcss.com)
- 🛠️ **Backend**: [Express.js](https://expressjs.com) + [Bun](https://bun.sh)
- 💾 **Database**: [PostgreSQL](https://www.postgresql.org) + [Drizzle ORM](https://orm.drizzle.team)

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Bun](https://bun.sh/) (JavaScript Runtime)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <REPO-URL>
   cd minitwitter
   ```

2. **Install dependencies**
   ```bash
   bun install
   cd .\frontend\
   bun install
   ```

3. **Set up the database**
   ```bash
   docker-compose up -d
   ```

4. **Start the backend**
   ```bash
   bun run --watch src/app.ts
   ```

5. **Start the frontend**
   ```bash
   cd frontend
   bun run dev
   ```

6. **Stop the application**
   To stop the application, you can simply close the terminal windows running the backend and frontend.

## 🌐 Local Development

The application will be available at:
- Frontend: [http://localhost:4000](http://localhost:4000)

