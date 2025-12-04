# ProjectHub

ProjectHub is a **full-stack project management application** built with **React**, **Node.js**, and **MongoDB**.  
It helps teams and individuals organize, track, and manage projects efficiently.

---

## Development Environment

During development, **Vagrant** was used to create isolated environments.

- **Backend API (Vagrant)**: `192.168.56.10`  
- **Local Development**: Update API endpoints to `localhost` or your local IP

**Vagrant Setup:**

| VM        | RAM  | CPU Cores |
|-----------|------|-----------|
| Herat VM  | 8 GB | 2         |
| Kabul VM  | 2 GB | 1         |

**Ports for Development:**

- Backend API: `5000`  
- Frontend React app: `3000`  
- Vite dev server: `5173`

---

## Docker Setup

ProjectHub is fully dockerized for easy deployment.

**Included files:**

- `Dockerfile` – build backend and frontend  
- `docker-compose.yml` – orchestrate multiple services  
- `.env` – environment-specific configuration

**Start the application with Docker:**

```bash
docker compose up --build -d
```

# GitHub Deployment Workflow
The project uses a single GitHub Actions workflow for deployment:

Branch	Target Server	Steps
dev	Vagrant Development	SSH to vagrant@192.168.56.10, pull dev branch, restart Docker
main	Production Server (AWS)	SSH to production host, pull main branch, restart Docker

# Workflow Steps:

Checkout the latest code from GitHub

Setup SSH key from repository secrets (DEV_SERVER_SSH_KEY or PROD_SERVER_SSH_KEY)

Deploy the application by pulling the latest code and restarting Docker containers

Local Development
Clone the repository:

```bash
git clone <repo-url>
cd projecthub-Devops
```
Install dependencies:

```bash
npm install
```
Setup your .env file (copy from .env.example)

Start frontend and backend:

```bash
npm run dev
```
Access the app:

Frontend: http://localhost:5173

Backend API: http://localhost:5000

# Summary

ProjectHub is a full-stack project management app with:

Vagrant-based isolated development environments

Dockerized backend and frontend

GitHub Actions workflow for automated deployment

Clear separation between development (dev branch → Vagrant) and production (main branch → server)


