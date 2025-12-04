# ProjectHub

ProjectHub is a project management application built using React, Node.js, and MongoDB. It helps teams and individuals organize, track, and manage projects efficiently.

Development Environment

During development, Vagrant was used to create isolated environments. The backend API in the Vagrant environment was accessible at 192.168.56.10. For local development outside Vagrant, make sure to update API endpoints to localhost or the appropriate local IP.

Vagrant setup included:

Herat VM: 8 GB RAM, 2 CPU cores

Kabul VM: 2 GB RAM, 1 CPU core

Ports Forwarded for Development

Backend API: 5000

Frontend React app: 3000

Vite dev server: 5173

Docker Setup

ProjectHub has been fully dockerized for easy deployment. The project includes:

Dockerfile for building backend and frontend services

docker-compose.yml for orchestrating multiple services

.env file for environment-specific configurations

To start the application using Docker:

docker compose up --build -d

GitHub Deployment Workflow

The project uses a single GitHub Actions workflow that deploys based on the branch pushed:

dev branch → deploys to Vagrant development server

main branch → deploys to production server

Workflow Steps

Checkout code: Pull the latest code from GitHub.

Setup SSH key: Uses repository secrets (DEV_SERVER_SSH_KEY or PROD_SERVER_SSH_KEY) to connect to the server.

Deploy:

Dev server:

SSH into vagrant@192.168.56.10

Pull latest code from dev branch

Restart Docker containers

Production server:

SSH into production host (e.g., ubuntu@3.111.40.33)

Pull latest code from main branch

Restart Docker containers

Local Development

Clone the repository:

git clone <repo-url>
cd projecthub-Devops


Install dependencies:

npm install


Set up .env file for your local environment (copy from .env.example)

Start frontend and backend:

npm run dev


Access the frontend at http://localhost:3000 and backend API at http://localhost:5000

Summary

ProjectHub is a full-stack project management app with:

Vagrant-based development environment

Dockerized backend and frontend

GitHub workflow for automated deployment

Clear separation of dev (dev branch → Vagrant) and production (main branch → production server)
