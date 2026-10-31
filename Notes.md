# 🐳 Docker + MERN Task Manager — Notes

## 1. Project Goal

⭐ **Goal:** Take a normal MERN application and run:

```text
React → Docker Container
Node/Express → Docker Container
MongoDB → Docker Container
```

with:

* Docker Images
* Docker Containers
* Docker Network
* Docker Volume
* Environment Variables
* Port Mapping

---

# 2. Project

Simple Task Manager:

```text
Frontend → React + Vite
Backend  → Node + Express
Database → MongoDB
```

APIs:

```text
GET    /api/health
GET    /api/tasks
POST   /api/tasks
DELETE /api/tasks/:id
```

---

# 3. Create Backend

⭐ Create backend:

```bash
mkdir server
cd server
npm init -y
```

### `npm init -y`

💡 Creates `package.json`.

`package.json` contains:

* Project information
* Dependencies
* Scripts

Install:

```bash
npm install express mongoose dotenv cors
npm install -D nodemon
```

---

# 4. Backend Important Parts

### Express

Handles HTTP requests and APIs.

### Mongoose

Connects Node.js with MongoDB.

### dotenv

Reads environment variables.

### CORS

Allows frontend and backend to communicate from different origins.

### Nodemon

Automatically restarts backend during development.

---

# 5. MongoDB Environment Variable

Normal local development:

```env
MONGODB_URI=mongodb://localhost:27017/docker_task_manager
```

Backend:

```js
mongoose.connect(process.env.MONGODB_URI);
```

⭐ Important:

```text
process.env.MONGODB_URI
        ↓
MongoDB connection string
```

---

# 6. Frontend

Create using Vite:

```bash
npm create vite@latest client
```

Choose:

```text
React
JavaScript
```

Install:

```bash
npm install
```

Run:

```bash
npm run dev
```

---

# 7. Frontend API URL

Instead of hardcoding the backend URL:

```js
http://localhost:5000
```

use:

```js
const API_URL = `${import.meta.env.VITE_API_URL}/api`;
```

⭐ `VITE_API_URL` allows the API URL to change depending on the environment.

---

# 8. Docker Basics

⭐ Docker packages an application and its dependencies into a containerized environment.

### Important Concepts

```text
Image     → Blueprint
Container → Running instance of Image
Network   → Container communication
Volume    → Persistent storage
Registry  → Stores Images
```

### Lifecycle

```text
Dockerfile
    ↓
docker build
    ↓
Image
    ↓
docker run
    ↓
Container
```

---

# 9. Docker Image\

⭐ **Image = Blueprint/template**

An image contains what is required to create a container.

Example:

```text
mern-task-server
```

---

# 10. Docker Container

⭐ **Container = Running instance of an Image**

Example:

```text
mern-server
```

One image can create multiple containers.

---

# 11. Dockerfile

⭐ Dockerfile contains instructions for building an image.

Basic backend Dockerfile:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Important Instructions

```text
FROM   → Base image
WORKDIR → Working directory
COPY   → Copy files
RUN    → Execute command during build
EXPOSE → Application port
CMD    → Command when container starts
```

---

# 12. Backend Dockerization

Build:

```bash
docker build -t mern-task-server ./server
```

Meaning:

```text
docker build
    ↓
Create image

-t mern-task-server
    ↓
Image name

./server
    ↓
Build context
```

Check:

```bash
docker images
```

---

# 13. `.dockerignore`

Backend:

```text
node_modules
.env
.git
npm-debug.log
```

⭐ `.dockerignore` prevents unnecessary/sensitive files from being sent into the Docker build context.

Important:

```text
node_modules → Don't copy local dependencies
.env         → Don't bake secrets into image
.git         → Not needed inside image
```

---

# 14. Port Mapping

⭐ Syntax:

```bash
-p HOST_PORT:CONTAINER_PORT
```

Example:

```bash
-p 5001:5000
```

Means:

```text
Host
5001
 ↓
Container
5000
```

Therefore:

```text
http://localhost:5001
```

reaches port `5000` inside the backend container.

---

# 15. Dockerizing Frontend

Frontend Dockerfile:

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

⭐ Frontend is built inside the Docker image.

Important:

```dockerfile
ARG VITE_API_URL
```

is a **build argument**.

Vite uses:

```text
VITE_API_URL
```

during:

```text
npm run build
```

---

# 16. Frontend Build

Because backend is exposed on host port `5001`:

```bash
docker build \
  --build-arg VITE_API_URL=http://localhost:5001 \
  -t mern-task-client ./client
```

⭐ Important:

The browser communicates with the backend through:

```text
http://localhost:5001
```

not `5000`.

---

# 17. MongoDB Container

MongoDB needs persistent storage.

Create volume:

```bash
docker volume create mongo-data
```

Run MongoDB:

```bash
docker run -d \
  --name mongo \
  --mount source=mongo-data,target=/data/db \
  -p 27017:27017 \
  mongo:8
```

---

# 18. Docker Volume

⭐ **Volume = Persistent storage managed by Docker.**

Without volume:

```text
Container removed
      ↓
Data can be lost
```

With volume:

```text
Container removed
      ↓
Volume remains
      ↓
Data remains
```

For MongoDB:

```text
MongoDB
   ↓
mongo-data
```

🔥 Database containers normally need persistent storage.

---

# 19. Docker Network

Create:

```bash
docker network create mern-network
```

⭐ Network allows Docker containers to communicate with each other.

Connect:

```bash
docker network connect mern-network mongo
docker network connect mern-network mern-server
```

Architecture:

```text
mern-server
     ↓
mern-network
     ↓
mongo
```

---

# 20. The Most Important Docker Networking Concept

⚠️ Inside a container:

```text
localhost
```

means **that same container**.

Therefore backend should NOT use:

```text
mongodb://localhost:27017/docker_task_manager
```

to connect to MongoDB container.

Use:

```text
mongodb://mongo:27017/docker_task_manager
```

Why?

```text
mongo
```

is the MongoDB container name and Docker's internal DNS resolves it.

⭐ Remember:

```text
Host → localhost
Container → service/container name
```

---

# 21. Backend + MongoDB

Recreate backend:

```bash
docker rm -f mern-server
```

Run:

```bash
docker run -d \
  --name mern-server \
  --network mern-network \
  -e PORT=5000 \
  -e MONGODB_URI=mongodb://mongo:27017/docker_task_manager \
  -p 5001:5000 \
  mern-task-server
```

Important:

```text
-e
```

sets an environment variable inside the container.

Therefore:

```text
-e MONGODB_URI=...
        ↓
process.env.MONGODB_URI
        ↓
mongoose.connect()
```

---

# 22. Verify Environment Variable

```bash
docker exec mern-server printenv MONGODB_URI
```

Expected:

```text
mongodb://mongo:27017/docker_task_manager
```

---

# 23. Host vs Container Communication

🔥 Very important.

### Browser → Backend

Browser is outside Docker:

```text
Browser
   ↓
localhost:5001
   ↓
Backend container
```

### Backend → MongoDB

Backend is inside Docker:

```text
Backend container
   ↓
mern-network
   ↓
mongo:27017
   ↓
MongoDB container
```

Therefore:

```text
Browser → localhost:5001

Backend → mongo:27017
```

---

# 24. Final Architecture

```text
                    Browser
                       │
             ┌─────────┴─────────┐
             │                   │
        :4173                 :5001
             │                   │
             ▼                   ▼
      ┌────────────┐      ┌────────────┐
      │   React    │      │  Express   │
      │  Container │─────▶│  Container │
      │ mern-client│      │ mern-server│
      └────────────┘      └─────┬──────┘
                                │
                         mern-network
                                │
                                ▼
                         ┌────────────┐
                         │  MongoDB   │
                         │  Container │
                         │    mongo   │
                         └─────┬──────┘
                               │
                               ▼
                         mongo-data
                           Volume
```

---

# 25. Full Request Flow

### Add Task

```text
User
 ↓
React
 ↓
POST /api/tasks
 ↓
localhost:5001
 ↓
Express
 ↓
Mongoose
 ↓
MongoDB
 ↓
mongo-data
```

### Get Tasks

```text
React
 ↓
GET /api/tasks
 ↓
Express
 ↓
MongoDB
 ↓
JSON response
 ↓
React UI
```

---

# 26. Important Docker Commands

### Docker

```bash
docker --version
docker info
```

### Images

```bash
docker images
docker pull <image>
docker build -t <name> <path>
docker rmi <image>
```

### Containers

```bash
docker ps
docker ps -a
docker run <image>
docker run -d <image>
docker stop <container>
docker start <container>
docker rm <container>
docker rm -f <container>
docker logs <container>
docker exec -it <container> sh
```

### Network

```bash
docker network ls
docker network create <network>
docker network inspect <network>
docker network connect <network> <container>
```

### Volume

```bash
docker volume ls
docker volume create <volume>
docker volume inspect <volume>
```

---

# 27. Problems We Faced

## Problem 1 — Wrong Docker version command

Used:

```bash
docker --v
```

Solution:

```bash
docker --version
```

---

## Problem 2 — Docker daemon not ready

```bash
docker run hello-world
```

failed initially.

💡 Docker Desktop/Docker Engine was not ready.

Solution:

```text
Start Docker Desktop
        ↓
Wait for Docker Engine
        ↓
Run command again
```

---

## Problem 3 — Container name already exists

Error:

```text
Conflict: container name is already in use
```

Solution:

```bash
docker rm -f mern-server
```

Then create the container again.

---

## Problem 4 — Port conflict

Port `5000` was unavailable.

Solution:

```bash
-p 5001:5000
```

Meaning:

```text
Host 5001 → Container 5000
```

---

## Problem 5 — MongoDB `localhost` issue

Wrong inside backend container:

```text
mongodb://localhost:27017/...
```

Correct:

```text
mongodb://mongo:27017/...
```

Reason:

```text
localhost = current container
mongo     = MongoDB container
```

---

## Problem 6 — `Cannot GET /api/tasks`

Cause:

The Docker image was created before the latest route code.

Solution:

```bash
docker build -t mern-task-server ./server
```

Then recreate the container.

⭐ Important:

```text
Code changed
    ↓
Rebuild image
    ↓
Recreate container
```

---

## Problem 7 — Frontend couldn't reflect new tasks

Cause:

Frontend was built with:

```text
http://localhost:5000
```

but backend was exposed on:

```text
http://localhost:5001
```

Solution:

```bash
docker build \
  --build-arg VITE_API_URL=http://localhost:5001 \
  -t mern-task-client ./client
```

---

# 28. Image vs Container

🔥 Interview question:

### What is the difference?

```text
Image
 ↓
Blueprint

Container
 ↓
Running instance of image
```

Example:

```text
mern-task-server
       ↓
   mern-server
```

---

# 29. `docker run` vs `docker start`

🔥 Important.

### `docker run`

Creates **and starts** a new container.

```bash
docker run ...
```

### `docker start`

Starts an existing stopped container.

```bash
docker start mern-server
```

---

# 30. `docker stop` vs `docker rm`

```text
docker stop
    ↓
Stops container

docker rm
    ↓
Removes container
```

A stopped container still exists.

Check with:

```bash
docker ps -a
```

---

# 31. `docker pull` vs `docker build`

### `docker pull`

Downloads an existing image:

```bash
docker pull mongo:8
```

### `docker build`

Creates an image from your Dockerfile:

```bash
docker build -t mern-task-server ./server
```

---

# 32. Stateless vs Stateful

⭐ Frontend/backend are generally:

```text
Stateless
```

Their containers can be recreated.

MongoDB is:

```text
Stateful
```

because it stores application data.

Therefore MongoDB needs:

```text
Volume
```

---

# 33. `.dockerignore` vs `.gitignore`

### `.gitignore`

Controls what Git should not track.

### `.dockerignore`

Controls what Docker should not send into the build context.

Example:

```text
node_modules
.env
.git
```

---

# 34. Why Docker?

⭐ Main problems Docker solves:

```text
Works on my machine
Environment differences
Dependency differences
Deployment inconsistency
Manual environment setup
```

Docker provides:

```text
Consistency
Portability
Isolation
Reproducibility
```

---

# 35. Final Project Checklist

```text
✅ MERN application created
✅ Backend created
✅ Frontend created
✅ MongoDB connected
✅ CRUD API working

✅ Backend Dockerfile
✅ Frontend Dockerfile
✅ .dockerignore
✅ Docker images
✅ Docker containers
✅ Docker network
✅ Docker volume
✅ Environment variables
✅ Port mapping

✅ Frontend → Backend
✅ Backend → MongoDB
✅ MongoDB → Persistent volume
```

---

# 🔁 30-Second Revision

```text
Dockerfile
   ↓
Image
   ↓
Container

Frontend → Container
Backend  → Container
MongoDB  → Container

Backend ↔ Docker Network ↔ MongoDB

MongoDB → Docker Volume

Browser → localhost:4173 → Frontend

Browser → localhost:5001 → Backend

Backend → mongo:27017 → MongoDB
```

### Most important rules:

```text
⭐ Image = Blueprint
⭐ Container = Running instance
⭐ Network = Communication
⭐ Volume = Persistent data
⭐ -p = Port mapping
⭐ -e = Environment variable
⭐ localhost inside container = that container
⭐ mongo = MongoDB container name
⭐ Code change → rebuild image
```

---

# ⏭️ Next Topic

The manual Docker setup is complete.

The next problem is:

> "Why should I manually create three containers, a network, a volume, and environment variables every time?"

The solution is:

# 🐳 Docker Compose

```text
docker-compose.yml
       ↓
client
server
mongo
network
volume
       ↓
docker compose up
```

After Docker Compose, the next stages are:

```text
Docker Compose
      ↓
Multi-stage Builds
      ↓
Production Images
      ↓
Nginx
      ↓
VPS Deployment
      ↓
GitLab CI/CD
```
