# 🐳 Dockerizing a MERN Application — Complete From-Scratch Guide

A complete practical guide to building a MERN application from scratch and Dockerizing the **React frontend, Node.js/Express backend, and MongoDB database**.

This project is intentionally simple so that the Docker concepts are easy to understand and can later be applied to larger MERN applications.

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [What We Are Building](#-what-we-are-building)
3. [Technologies Used](#-technologies-used)
4. [Prerequisites](#-prerequisites)
5. [Project Architecture](#-project-architecture)
6. [Create the Project](#1-create-the-project)
7. [Create the Backend](#2-create-the-backend)
8. [Create the Frontend](#3-create-the-frontend)
9. [Run the MERN Application Normally](#4-run-the-mern-application-normally)
10. [Docker Concepts Before Starting](#5-docker-concepts-before-starting)
11. [Dockerizing the Backend](#6-dockerizing-the-backend)
12. [Dockerizing the Frontend](#7-dockerizing-the-frontend)
13. [Dockerizing MongoDB](#8-dockerizing-mongodb)
14. [Docker Network](#9-create-a-docker-network)
15. [Connect Backend to MongoDB](#10-connect-backend-to-mongodb)
16. [Connect Frontend to Dockerized Backend](#11-connect-frontend-to-dockerized-backend)
17. [Final Testing](#12-final-testing)
18. [Problems Faced and Solutions](#-problems-faced-and-solutions)
19. [Important Docker Concepts Learned](#-important-docker-concepts-learned)
20. [Docker Commands Cheat Sheet](#-docker-commands-cheat-sheet)
21. [Final Docker Architecture](#-final-docker-architecture)
22. [Current Project Status](#-current-project-status)
23. [Next Step — Docker Compose](#-next-step--docker-compose)
24. [Learning Summary](#-learning-summary)

---

# 🚀 Project Overview

The goal of this project is to understand how to take a normal MERN application and run its different components using Docker.

The application contains:

* React + Vite frontend
* Node.js + Express backend
* MongoDB database
* Docker containers
* Docker image
* Docker network
* Docker volume
* Environment variables
* Port mapping

The final application will run as:

```text
Frontend  → http://localhost:4173
Backend   → http://localhost:5001
MongoDB   → localhost:27017
```

---

# 🎯 What We Are Building

We are building a simple **Task Manager**.

The application supports:

```text
GET     /api/health
GET     /api/tasks
POST    /api/tasks
DELETE  /api/tasks/:id
```

The user can:

* View tasks
* Add tasks
* Delete tasks
* Refresh the page
* Persist tasks in MongoDB

---

# 🛠 Technologies Used

## Application

* React
* Vite
* Node.js
* Express.js
* MongoDB
* Mongoose
* JavaScript

## Docker

* Docker Desktop
* Docker Engine
* Docker Images
* Docker Containers
* Docker Network
* Docker Volume
* Dockerfile
* `.dockerignore`

---

# 📋 Prerequisites

Install:

* Node.js
* npm
* Docker Desktop
* Git

Verify Node:

```powershell
node --version
```

Verify npm:

```powershell
npm --version
```

Verify Docker:

```powershell
docker --version
```

Start Docker Desktop before running Docker commands.

---

# 🏗 Project Structure

The project starts with:

```text
docker-mern-task-manager/
│
├── client/
│
└── server/
```

After Docker configuration:

```text
docker-mern-task-manager/
│
├── client/
│   ├── src/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── models/
│   │   │   └── task.model.js
│   │   │
│   │   ├── routes/
│   │   │   └── task.routes.js
│   │   │
│   │   └── server.js
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# 1. Create the Project

Create the main project directory:

```powershell
mkdir docker-mern-task-manager
cd docker-mern-task-manager
```

Create frontend:

```powershell
npm create vite@latest client
```

Choose:

```text
Framework: React
Variant: JavaScript
```

Then:

```powershell
cd client
npm install
cd ..
```

Create the backend:

```powershell
mkdir server
cd server
npm init -y
```

### Why `npm init -y`?

It creates the `package.json` file automatically.

`package.json` contains:

* Project information
* Dependencies
* Scripts
* Version
* Application metadata

---

# 2. Create the Backend

Go into the server:

```powershell
cd server
```

Install the backend dependencies:

```powershell
npm install express mongoose dotenv cors
```

Install nodemon for development:

```powershell
npm install -D nodemon
```

---

## Backend `package.json`

The important scripts are:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

### Why?

Development:

```powershell
npm run dev
```

uses Nodemon and automatically restarts the server when code changes.

Production-style execution:

```powershell
npm start
```

runs:

```text
node src/server.js
```

Docker will use:

```dockerfile
CMD ["npm", "start"]
```

---

# 3. Backend Structure

Create:

```text
server/
└── src/
    ├── models/
    │   └── task.model.js
    │
    ├── routes/
    │   └── task.routes.js
    │
    └── server.js
```

---

# 4. MongoDB Connection

The backend uses:

```js
mongoose.connect(process.env.MONGODB_URI);
```

This is important because the MongoDB URL should not be hardcoded.

For normal local development, the MongoDB URL can be:

```text
mongodb://localhost:27017/docker_task_manager
```

However, when the backend runs inside Docker, `localhost` has a different meaning.

Inside the backend container:

```text
localhost
```

means:

```text
the backend container itself
```

It does **not** mean the MongoDB container.

Later, after creating the Docker network, we use:

```text
mongodb://mongo:27017/docker_task_manager
```

where:

```text
mongo
```

is the MongoDB container name.

---

# 5. Backend Server

The backend server contains:

```js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const taskRoutes = require("./routes/task.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
```

---

# 6. Task Model

Create:

```text
server/src/models/task.model.js
```

The model contains:

```js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Task", taskSchema);
```

---

# 7. Task Routes

Create:

```text
server/src/routes/task.routes.js
```

The routes provide:

```text
GET     /api/tasks
POST    /api/tasks
DELETE  /api/tasks/:id
```

The important route registration in `server.js` is:

```js
app.use("/api/tasks", taskRoutes);
```

and inside the router:

```js
router.get("/");
```

Together they create:

```text
GET /api/tasks
```

---

# 8. Run Backend Normally

Before Dockerizing anything, make sure the normal backend works.

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/docker_task_manager
```

Start the backend:

```powershell
npm run dev
```

Test:

```text
http://localhost:5000/api/health
```

Expected:

```json
{
  "success": true,
  "message": "Server is running"
}
```

---

# 9. Create the Frontend

Go to the client:

```powershell
cd ../client
```

Install dependencies:

```powershell
npm install
```

Start the frontend:

```powershell
npm run dev
```

Vite normally provides a URL such as:

```text
http://localhost:5173
```

---

# 10. Frontend API Configuration

The frontend uses:

```js
const API_URL = `${import.meta.env.VITE_API_URL}/api`;
```

This is important for Docker.

Instead of hardcoding:

```text
http://localhost:5000
```

we use:

```text
VITE_API_URL
```

---

# 11. Test the Normal MERN Application

Before Dockerizing:

```text
React
  ↓
Express
  ↓
MongoDB
```

Make sure you can:

* Open the frontend
* Fetch tasks
* Add tasks
* Delete tasks
* Refresh the page
* See persisted data

Only after the normal application works should Dockerization begin.

---

# 🐳 12. Docker Concepts Before Starting

Docker packages applications and their dependencies into portable environments called containers.

Important concepts:

```text
Image     → Blueprint
Container → Running instance of an image
Network   → Communication between containers
Volume    → Persistent storage
Registry  → Stores/distributes images
```

Basic lifecycle:

```text
Dockerfile
    ↓
docker build
    ↓
Docker Image
    ↓
docker run
    ↓
Docker Container
```

---

# 13. Verify Docker

Run:

```powershell
docker --version
```

Test Docker:

```powershell
docker run hello-world
```

If `hello-world` runs successfully, Docker is working.

---

# 14. Useful Docker Commands

Pull an image:

```powershell
docker pull nginx
```

List images:

```powershell
docker images
```

Run a container:

```powershell
docker run nginx
```

Run in detached mode:

```powershell
docker run -d nginx
```

List running containers:

```powershell
docker ps
```

List all containers:

```powershell
docker ps -a
```

Stop a container:

```powershell
docker stop <container>
```

Start an existing container:

```powershell
docker start <container>
```

Remove a container:

```powershell
docker rm <container>
```

Force remove:

```powershell
docker rm -f <container>
```

View logs:

```powershell
docker logs <container>
```

Execute a command inside a container:

```powershell
docker exec -it <container> sh
```

Remove an image:

```powershell
docker rmi <image>
```

---

# 15. Understand Port Mapping

Docker uses:

```text
-p HOST_PORT:CONTAINER_PORT
```

Example:

```powershell
docker run -p 5001:5000 ...
```

means:

```text
Host machine port 5001
          ↓
Container port 5000
```

Therefore:

```text
Browser → localhost:5001
             ↓
       container:5000
```

---

# 🐳 16. Dockerizing the Backend

Create:

```text
server/Dockerfile
```

Add:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

---

## Dockerfile Explanation

### `FROM`

```dockerfile
FROM node:20-alpine
```

Provides Node.js and a lightweight Alpine Linux environment.

### `WORKDIR`

```dockerfile
WORKDIR /app
```

Sets the working directory inside the container.

### `COPY package*.json`

```dockerfile
COPY package*.json ./
```

Copies package files first.

### `RUN npm install`

```dockerfile
RUN npm install
```

Installs dependencies inside the image.

### `COPY . .`

```dockerfile
COPY . .
```

Copies application source code.

### `EXPOSE`

```dockerfile
EXPOSE 5000
```

Documents the port used by the application.

### `CMD`

```dockerfile
CMD ["npm", "start"]
```

Starts the application when the container runs.

---

# 17. Backend `.dockerignore`

Create:

```text
server/.dockerignore
```

Add:

```text
node_modules
.env
.git
npm-debug.log
```

### Why?

We don't want to copy unnecessary or sensitive files into the Docker build context.

Especially:

```text
node_modules
```

Docker should install dependencies itself.

And:

```text
.env
```

should not be baked into the image.

---

# 18. Build the Backend Image

From the project root:

```powershell
docker build -t mern-task-server ./server
```

Meaning:

```text
docker build
```

Build an image.

```text
-t mern-task-server
```

Give the image a name.

```text
./server
```

Use the server directory as the build context.

Check:

```powershell
docker images
```

You should see:

```text
mern-task-server
```

---

# 19. Run the Backend Container

Initially, the backend can be run with:

```powershell
docker run -d `
  --name mern-server `
  -p 5001:5000 `
  mern-task-server
```

However, the backend also needs MongoDB.

We later recreate this container with the Docker network and MongoDB environment variable.

---

# 🐳 20. Dockerizing the Frontend

Create:

```text
client/Dockerfile
```

Add:

```dockerfile
FROM node:20-alpine

WORKDIR /app

ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
```

---

# 21. Frontend Dockerfile Explanation

The frontend is built inside Docker.

Important:

```dockerfile
ARG VITE_API_URL
```

defines a build argument.

Then:

```dockerfile
ENV VITE_API_URL=$VITE_API_URL
```

makes it available during the Vite build.

Then:

```dockerfile
RUN npm run build
```

creates the production frontend build.

Vite environment variables beginning with:

```text
VITE_
```

are exposed to the frontend during the build.

Therefore the API URL gets baked into the frontend build.

---

# 22. Frontend `.dockerignore`

Create:

```text
client/.dockerignore
```

Add:

```text
node_modules
dist
.env
.git
npm-debug.log
```

---

# 23. Build the Frontend Image

Initially:

```powershell
docker build --build-arg VITE_API_URL=http://localhost:5000 -t mern-task-client ./client
```

Later, because the Dockerized backend is exposed to the host on port `5001`, rebuild it with:

```powershell
docker build --build-arg VITE_API_URL=http://localhost:5001 -t mern-task-client ./client
```

This is important.

The browser accesses the backend through:

```text
localhost:5001
```

not:

```text
localhost:5000
```

---

# 24. Run the Frontend Container

```powershell
docker run -d `
  --name mern-client `
  -p 4173:4173 `
  mern-task-client
```

Open:

```text
http://localhost:4173
```

---

# 🗄️ 25. Dockerizing MongoDB

MongoDB is different from the frontend and backend.

Frontend and backend containers can be recreated.

MongoDB contains important data.

Therefore we need persistent storage.

---

# 26. Create MongoDB Volume

Create a named volume:

```powershell
docker volume create mongo-data
```

Check:

```powershell
docker volume ls
```

You should see:

```text
mongo-data
```

---

# 27. Run MongoDB Container

```powershell
docker run -d `
  --name mongo `
  --mount source=mongo-data,target=/data/db `
  -p 27017:27017 `
  mongo:8
```

### Why use a volume?

Without persistent storage:

```text
Container removed
      ↓
Database data may be lost
```

With a named volume:

```text
Container removed
      ↓
Volume remains
      ↓
Database data remains
```

---

# 28. Check MongoDB

```powershell
docker ps
```

Check MongoDB logs:

```powershell
docker logs mongo
```

---

# 🌐 29. Create Docker Network

Create a network:

```powershell
docker network create mern-network
```

Check:

```powershell
docker network ls
```

The network allows containers to communicate with each other.

---

# 30. Connect Containers to the Network

Connect MongoDB:

```powershell
docker network connect mern-network mongo
```

Connect backend:

```powershell
docker network connect mern-network mern-server
```

The important concept is:

```text
mern-server
     ↓
mern-network
     ↓
mongo
```

Docker provides internal DNS resolution using container/service names.

---

# 🔑 31. MongoDB URL Inside Docker

This is one of the most important concepts in this project.

For normal local development:

```text
mongodb://localhost:27017/docker_task_manager
```

Inside the Docker network:

```text
mongodb://mongo:27017/docker_task_manager
```

Why?

Because:

```text
mongo
```

is the MongoDB container name.

Docker resolves:

```text
mongo
```

to the MongoDB container's internal IP.

---

# 32. Recreate Backend Container With MongoDB

Remove the old backend container:

```powershell
docker rm -f mern-server
```

Run it again:

```powershell
docker run -d `
  --name mern-server `
  --network mern-network `
  -e PORT=5000 `
  -e MONGODB_URI=mongodb://mongo:27017/docker_task_manager `
  -p 5001:5000 `
  mern-task-server
```

### Important

This:

```text
-e MONGODB_URI=...
```

passes the MongoDB connection string into the container.

The backend reads it using:

```js
process.env.MONGODB_URI
```

Therefore:

```text
Docker environment variable
        ↓
process.env.MONGODB_URI
        ↓
mongoose.connect(...)
```

---

# 33. Verify the Environment Variable

Run:

```powershell
docker exec mern-server printenv MONGODB_URI
```

Expected:

```text
mongodb://mongo:27017/docker_task_manager
```

This confirms that Docker injected the variable into the container.

---

# 34. Rebuild Frontend With Correct Backend URL

Because the browser accesses the backend through port `5001`, rebuild the frontend:

```powershell
docker rm -f mern-client
```

Then:

```powershell
docker build --build-arg VITE_API_URL=http://localhost:5001 -t mern-task-client ./client
```

Run:

```powershell
docker run -d `
  --name mern-client `
  -p 4173:4173 `
  mern-task-client
```

---

# 🔍 35. Final Testing

Check all containers:

```powershell
docker ps
```

Expected:

```text
mern-client
mern-server
mongo
```

---

## Test Backend Health

Open:

```text
http://localhost:5001/api/health
```

Expected:

```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## Test Tasks API

Open:

```text
http://localhost:5001/api/tasks
```

Expected initially:

```json
{
  "success": true,
  "tasks": []
}
```

---

## Test Frontend

Open:

```text
http://localhost:4173
```

Test:

```text
Add Task
   ↓
Frontend
   ↓
POST /api/tasks
   ↓
Express
   ↓
MongoDB
```

Then:

```text
GET /api/tasks
```

The newly created task should appear.

---

# 🐛 Problems Faced and Solutions

This section documents the actual issues encountered while building this project.

---

## ❌ Problem 1 — Docker command

Command attempted:

```powershell
docker --v
```

Docker returned an unknown option error.

### Solution

Use:

```powershell
docker --version
```

---

# ❌ Problem 2 — Docker daemon was not ready

The first:

```powershell
docker run hello-world
```

failed because Docker Desktop/Docker Engine was not ready.

### Solution

Start Docker Desktop and wait until Docker Engine is running.

Then run:

```powershell
docker run hello-world
```

---

# ❌ Problem 3 — Existing container name

When creating the backend:

```powershell
docker run -d --name mern-server ...
```

Docker reported that the container name was already being used.

### Cause

A previous container named:

```text
mern-server
```

already existed.

Check:

```powershell
docker ps -a
```

### Solution

Remove the old container:

```powershell
docker rm mern-server
```

or:

```powershell
docker rm -f mern-server
```

Then create the new container.

---

# ❌ Problem 4 — Port 5000 conflict

The existing backend container could not start because port `5000` was already allocated.

### Solution

Use a different host port:

```powershell
-p 5001:5000
```

This means:

```text
Host:      5001
Container: 5000
```

Therefore:

```text
http://localhost:5001
```

reaches the backend's port `5000`.

---

# ❌ Problem 5 — Backend could not use `localhost` for MongoDB

A common Docker mistake is:

```text
mongodb://localhost:27017/docker_task_manager
```

inside the backend container.

### Why it fails

Inside a container:

```text
localhost
```

means that container itself.

It does not mean the MongoDB container.

### Solution

Put the containers on the same Docker network:

```text
mern-network
```

and use:

```text
mongodb://mongo:27017/docker_task_manager
```

---

# ❌ Problem 6 — `GET /api/tasks` returned `Cannot GET /api/tasks`

Response:

```html
Cannot GET /api/tasks
```

### Cause

The Docker image had been built before the latest task route changes.

Docker images contain a snapshot of the application at build time.

The local source code changed, but the old Docker image still contained the previous code.

### Solution

Rebuild the backend image:

```powershell
docker build -t mern-task-server ./server
```

Then recreate the container:

```powershell
docker rm -f mern-server
```

```powershell
docker run -d `
  --name mern-server `
  --network mern-network `
  -e PORT=5000 `
  -e MONGODB_URI=mongodb://mongo:27017/docker_task_manager `
  -p 5001:5000 `
  mern-task-server
```

---

# ❌ Problem 7 — Tasks added from frontend were not appearing

The backend API was working:

```text
http://localhost:5001/api/tasks
```

but frontend requests were using the wrong API URL.

### Cause

The frontend Docker image had originally been built with:

```text
http://localhost:5000
```

But the Dockerized backend was exposed to the host through:

```text
http://localhost:5001
```

### Solution

Rebuild the frontend:

```powershell
docker rm -f mern-client
```

```powershell
docker build --build-arg VITE_API_URL=http://localhost:5001 -t mern-task-client ./client
```

Then:

```powershell
docker run -d `
  --name mern-client `
  -p 4173:4173 `
  mern-task-client
```

---

# ❌ Problem 8 — Confusion about `.env` and Docker environment variables

The backend showed:

```text
◇ injected env (0) from .env
```

This did not mean Docker failed to inject the MongoDB URL.

We verified the actual Docker environment with:

```powershell
docker exec mern-server printenv MONGODB_URI
```

Result:

```text
mongodb://mongo:27017/docker_task_manager
```

Therefore the Docker environment variable was correctly configured.

---

# ❌ Problem 9 — Why changing local code did not change the container

A Docker image is created from the source code at build time.

Example:

```text
Local Code
    ↓
docker build
    ↓
Image
    ↓
docker run
    ↓
Container
```

If the local code changes later:

```text
Local Code changed
```

the existing image does not automatically change.

You must rebuild:

```powershell
docker build ...
```

and recreate the container when necessary.

---

# 🧠 Important Docker Concepts Learned

## Image

A read-only blueprint used to create containers.

```text
Dockerfile → Image
```

---

## Container

A running instance of an image.

```text
Image → Container
```

---

## Dockerfile

A set of instructions used to build an image.

Example:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## Docker Network

Allows containers to communicate.

```text
mern-server
     ↕
mern-network
     ↕
mongo
```

---

## Docker Volume

Provides persistent storage.

```text
MongoDB
   ↓
mongo-data volume
```

If the MongoDB container is removed, the named volume can remain.

---

## Port Mapping

```text
-p HOST:CONTAINER
```

Example:

```text
-p 5001:5000
```

means:

```text
localhost:5001
       ↓
container:5000
```

---

## Environment Variable

The backend receives:

```text
MONGODB_URI=mongodb://mongo:27017/docker_task_manager
```

and accesses it through:

```js
process.env.MONGODB_URI
```

---

# 📚 Docker Commands Cheat Sheet

## Docker Information

```powershell
docker --version
```

```powershell
docker info
```

---

## Images

```powershell
docker images
```

```powershell
docker pull <image>
```

```powershell
docker build -t <image-name> <path>
```

```powershell
docker rmi <image>
```

---

## Containers

```powershell
docker ps
```

```powershell
docker ps -a
```

```powershell
docker run <image>
```

```powershell
docker run -d <image>
```

```powershell
docker stop <container>
```

```powershell
docker start <container>
```

```powershell
docker rm <container>
```

```powershell
docker rm -f <container>
```

```powershell
docker logs <container>
```

```powershell
docker exec -it <container> sh
```

---

## Networks

Create:

```powershell
docker network create mern-network
```

List:

```powershell
docker network ls
```

Inspect:

```powershell
docker network inspect mern-network
```

Connect:

```powershell
docker network connect mern-network <container>
```

---

## Volumes

Create:

```powershell
docker volume create mongo-data
```

List:

```powershell
docker volume ls
```

Inspect:

```powershell
docker volume inspect mongo-data
```

---

# 🏗 Final Docker Architecture

The final application looks like this:

```text
                         ┌─────────────────────┐
                         │       Browser       │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    │                               │
             localhost:4173                  localhost:5001
                    │                               │
                    ▼                               ▼
          ┌─────────────────┐             ┌─────────────────┐
          │  React/Vite     │             │ Node/Express    │
          │  Container      │────────────▶│ Container       │
          │  mern-client    │             │ mern-server     │
          └─────────────────┘             └────────┬────────┘
                                                    │
                                                    │
                                             mern-network
                                                    │
                                                    ▼
                                           ┌─────────────────┐
                                           │    MongoDB      │
                                           │    Container     │
                                           │      mongo       │
                                           └────────┬────────┘
                                                    │
                                                    ▼
                                           ┌─────────────────┐
                                           │   mongo-data    │
                                           │     Volume      │
                                           └─────────────────┘
```

---

# 🔄 Complete Request Flow

When a user adds a task:

```text
User
 │
 ▼
React Frontend
 │
 │ POST /api/tasks
 ▼
http://localhost:5001
 │
 ▼
Express Backend
 │
 │ mongoose
 ▼
MongoDB Container
 │
 ▼
mongo-data Volume
```

When the user loads tasks:

```text
Browser
   ↓
React
   ↓
GET /api/tasks
   ↓
Express
   ↓
MongoDB
   ↓
JSON Response
   ↓
React UI
```

---

# 🌍 Host vs Docker Communication

This distinction is extremely important.

## Browser → Backend

The browser runs outside Docker.

Therefore:

```text
http://localhost:5001
```

is correct.

---

## Backend → MongoDB

The backend runs inside Docker.

Therefore:

```text
mongodb://mongo:27017/docker_task_manager
```

is correct.

---

## Why are they different?

Because:

```text
Browser
  ↓
Host machine
  ↓
Port mapping
  ↓
Backend container
```

while:

```text
Backend container
  ↓
Docker network
  ↓
MongoDB container
```

---

# 🔐 Security Notes

Do not commit real secrets.

Avoid putting sensitive values directly into:

```text
Dockerfile
```

or:

```text
Git repository
```

For example:

```text
.env
```

should normally be included in:

```text
.gitignore
```

and:

```text
.dockerignore
```

Production applications should use proper secret/environment management.

---

# 📦 Current Docker Containers

At the end of this stage:

```text
mern-client
    ↓
React frontend
    ↓
Port 4173
```

```text
mern-server
    ↓
Node + Express backend
    ↓
Port 5000 inside container
    ↓
Port 5001 on host
```

```text
mongo
    ↓
MongoDB
    ↓
Port 27017
    ↓
mongo-data volume
```

---

# 🔎 Final Verification Checklist

Run:

```powershell
docker ps
```

You should have:

```text
mern-client
mern-server
mongo
```

Check backend:

```powershell
docker logs mern-server
```

Check MongoDB:

```powershell
docker logs mongo
```

Check environment:

```powershell
docker exec mern-server printenv MONGODB_URI
```

Expected:

```text
mongodb://mongo:27017/docker_task_manager
```

Test:

```text
http://localhost:5001/api/health
```

Test:

```text
http://localhost:5001/api/tasks
```

Open:

```text
http://localhost:4173
```

Then:

* Add a task
* Delete a task
* Refresh
* Verify the task persists
* Verify `/api/tasks` returns the data

---

# 🚀 Next Step — Docker Compose

At this stage, all three parts are working manually:

```text
Frontend Container
Backend Container
MongoDB Container
```

But notice how many commands are required:

```text
docker volume create ...
docker network create ...
docker network connect ...
docker build ...
docker run ...
docker rm ...
docker run ...
```

This becomes difficult as the application grows.

Docker Compose solves this by allowing us to define the application's services in one file:

```text
docker-compose.yml
```

Then instead of manually creating and connecting everything, we can use:

```powershell
docker compose up
```

and:

```powershell
docker compose down
```

The architecture will become:

```text
docker-compose.yml
        │
        ├── client
        │
        ├── server
        │
        └── mongo
```

Docker Compose will handle:

* Container creation
* Networking
* Environment variables
* Port mappings
* MongoDB volume
* Service configuration
* Starting multiple services together

---

# 🎓 Learning Summary

By completing this project, we learned the complete basic Docker workflow for a MERN application.

```text
MERN Application
       ↓
Dockerfile
       ↓
Docker Image
       ↓
Docker Container
       ↓
Docker Network
       ↓
Container-to-container communication
       ↓
Docker Volume
       ↓
Persistent MongoDB data
```

The most important concepts are:

```text
Image     → Blueprint
Container → Running instance
Network   → Container communication
Volume    → Persistent data
Dockerfile → Image instructions
Port      → Host ↔ Container communication
Environment Variable → Runtime/build configuration
```

---

# ⭐ Final Takeaway

A normal MERN application looks like:

```text
React
 ↓
Express
 ↓
MongoDB
```

A Dockerized MERN application looks like:

```text
React Container
      ↓
Docker Network
      ↓
Express Container
      ↓
Docker Network
      ↓
MongoDB Container
      ↓
MongoDB Volume
```

The biggest lesson is not simply learning Docker commands.

The important understanding is:

> **Docker packages the application and its environment so that the application can run consistently across different environments.**

Once this manual Docker setup is understood, Docker Compose, production images, Nginx, VPS deployment, and CI/CD become much easier to understand.

---

# 📌 Project Status

```text
✅ MERN application created
✅ Backend created with npm init
✅ Express API created
✅ MongoDB connection created
✅ React frontend created with Vite
✅ Task CRUD functionality created
✅ Backend Dockerfile created
✅ Frontend Dockerfile created
✅ .dockerignore configured
✅ Backend Docker image created
✅ Frontend Docker image created
✅ MongoDB Docker container created
✅ MongoDB named volume created
✅ Docker network created
✅ Backend connected to MongoDB through Docker network
✅ Frontend connected to Dockerized backend
✅ Full application tested
```

## 🎯 Completed

**Manual Dockerization of a MERN application**

## ⏭️ Next

**Docker Compose → Multi-stage production builds → Nginx → VPS deployment → GitLab CI/CD**
