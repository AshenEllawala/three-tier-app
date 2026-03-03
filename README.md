# 🏗️ 3-Tier Todo Application
### React · Node.js · PostgreSQL · Docker · Kubernetes · Jenkins CI/CD

> A production-grade 3-tier Todo application built to learn and demonstrate the full DevOps lifecycle — from local development to containerized deployment with automated CI/CD pipeline.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Step-by-Step Build Journey](#step-by-step-build-journey)
  - [Phase 1 — Backend (Node.js)](#phase-1--backend-nodejs)
  - [Phase 2 — Frontend (React)](#phase-2--frontend-react)
  - [Phase 3 — Docker](#phase-3--docker)
  - [Phase 4 — Kubernetes](#phase-4--kubernetes)
  - [Phase 5 — Jenkins CI/CD](#phase-5--jenkins-cicd)
- [Problems Faced & How I Solved Them](#problems-faced--how-i-solved-them)
- [Quick Start Guide](#quick-start-guide)
- [API Endpoints](#api-endpoints)
- [CI/CD Pipeline](#cicd-pipeline)
- [Key Achievements Proven](#key-achievements-proven)
- [Credits](#credits)

---

## Architecture Overview

```
                    👤 User (Browser)
                           ↓
              ┌────────────────────────┐
              │  TIER 1 - Frontend     │
              │  React + Nginx         │
              │  Port: 80              │
              └────────────────────────┘
                           ↓ REST API /api/tasks
              ┌────────────────────────┐
              │  TIER 2 - Backend      │
              │  Node.js + Express     │
              │  Port: 5000            │
              └────────────────────────┘
                           ↓ SQL Queries
              ┌────────────────────────┐
              │  TIER 3 - Database     │
              │  PostgreSQL            │
              │  Port: 5432            │
              └────────────────────────┘

All 3 tiers run in Docker containers
orchestrated by Kubernetes
deployed via Jenkins CI/CD pipeline
```

**Golden Rule:** Tier 1 (Frontend) NEVER talks directly to Tier 3 (Database). The Backend is the gatekeeper.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Nginx | UI and reverse proxy |
| Backend | Node.js + Express | REST API and business logic |
| Database | PostgreSQL | Data persistence |
| Containerization | Docker (multi-stage builds) | Lightweight portable containers |
| Orchestration | Kubernetes | Deployment, scaling, self-healing |
| CI/CD | Jenkins | Automated build and deployment |
| Registry | DockerHub | Versioned Docker image storage |
| Local Dev | Docker Compose | Run all 3 tiers with one command |

---

## Project Structure

```
three-tier-app/
├── frontend/                    ← Tier 1
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskForm.js      ← Input form
│   │   │   ├── TaskList.js      ← Task list renderer
│   │   │   └── TaskItem.js      ← Single task row
│   │   ├── App.js               ← Main component + API calls
│   │   ├── App.css              ← Dark theme styling
│   │   └── index.js             ← React entry point
│   ├── Dockerfile               ← Multi-stage build
│   ├── nginx.conf               ← Reverse proxy config
│   └── package.json
│
├── backend/                     ← Tier 2
│   ├── src/
│   │   ├── index.js             ← Server entry + /health endpoint
│   │   ├── db.js                ← PostgreSQL connection pool
│   │   └── routes.js            ← GET/POST/PUT/DELETE /api/tasks
│   ├── Dockerfile               ← Multi-stage build
│   ├── .env.example             ← Environment template
│   └── package.json
│
├── k8s/                         ← Kubernetes manifests
│   ├── database/
│   │   ├── secret.yaml          ← DB credentials (base64)
│   │   ├── configmap.yaml       ← DB configuration
│   │   ├── statefulset.yaml     ← PostgreSQL StatefulSet
│   │   └── service.yaml         ← Headless ClusterIP service
│   ├── backend/
│   │   ├── deployment.yaml      ← 2 replicas + probes + limits
│   │   └── service.yaml         ← ClusterIP service
│   └── frontend/
│       ├── deployment.yaml      ← 2 replicas
│       └── service.yaml         ← LoadBalancer service
│
├── jenkins/
│   ├── Jenkinsfile              ← 5-stage pipeline
│   └── Dockerfile               ← Custom Jenkins with Node+Docker
│
├── docs/                        ← Documentation
├── init.sql                     ← DB table creation script
├── docker-compose.yml           ← Local development
└── README.md
```

---

## Step-by-Step Build Journey

### Phase 1 — Backend (Node.js)

**Goal:** Build a REST API that connects to PostgreSQL.

**What I built:**
- Express server with 4 API routes (`GET`, `POST`, `PUT`, `DELETE`)
- PostgreSQL connection using `pg` (node-postgres) with connection pooling
- `/health` endpoint for Kubernetes health probes
- `.env` file for credentials — never hardcoded

**Key files:**
```
backend/src/index.js   → Server startup + health endpoint
backend/src/db.js      → PostgreSQL pool connection
backend/src/routes.js  → All /api/tasks routes
backend/.env.example   → Template for environment variables
```

**Test the backend locally:**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# Visit: http://localhost:5000/health
```

---

### Phase 2 — Frontend (React)

**Goal:** Build a UI that talks to the backend API only — never the database.

**What I built:**
- React app with 3 components: `TaskForm`, `TaskList`, `TaskItem`
- All API calls through `axios` to `/api/tasks`
- Nginx configured as reverse proxy to forward `/api` calls to backend
- Dark theme UI

**Key files:**
```
frontend/src/App.js              → Main component + API calls
frontend/src/components/         → TaskForm, TaskList, TaskItem
frontend/nginx.conf              → Reverse proxy configuration
```

**How Nginx acts as reverse proxy:**
```nginx
location /api {
    proxy_pass http://backend-service:5000;
}
```
Any request starting with `/api` from the browser gets forwarded to the Node.js backend. The frontend never touches the database directly.

---

### Phase 3 — Docker

**Goal:** Containerize all 3 tiers so they run the same everywhere.

#### Multi-Stage Dockerfiles

**Why multi-stage?** Separate build tools from runtime — smaller, more secure images.

```
Backend:  Single stage = ~820MB  →  Multi-stage = ~150MB  (83% reduction!)
Frontend: Builds React, then serves with Nginx (~25MB)
Database: Uses official postgres:15 image (no custom Dockerfile needed)
```

**Backend Dockerfile logic:**
```
Stage 1 (Builder): Install all dependencies, build production modules
Stage 2 (Runner):  Copy only node_modules + src code, run as non-root user
```

**Frontend Dockerfile logic:**
```
Stage 1 (Builder): Install deps, run npm run build → creates /app/build
Stage 2 (Nginx):   Copy /app/build to nginx html folder, serve statically
```

**Docker Compose — run everything with one command:**
```bash
docker-compose up --build
# Access app at: http://localhost
```

Docker Compose key concepts used:
- `depends_on` with `healthcheck` — ensures DB starts before backend
- Named volumes — database data persists across container restarts
- Custom network (`todo-network`) — containers talk by service name
- `init.sql` mounted to auto-create the tasks table on first start

---

### Phase 4 — Kubernetes

**Goal:** Deploy to Kubernetes with self-healing, scaling and persistent storage.

#### K8s Resources Used

| Resource | Used For | Why |
|----------|---------|-----|
| `Deployment` | Frontend + Backend | Stateless apps — pods are replaceable |
| `StatefulSet` | PostgreSQL | Stateful — needs stable identity + storage |
| `PersistentVolumeClaim` | Database storage | Data survives pod restarts |
| `ClusterIP Service` | Backend + DB | Internal cluster access only |
| `LoadBalancer Service` | Frontend | External user access |
| `Secret` | DB credentials | Secure base64-encoded storage |
| `ConfigMap` | DB config | Non-sensitive configuration |

**Deploy to Kubernetes:**
```bash
# Start Minikube
minikube start --driver=docker

# Build images inside Minikube's Docker
eval $(minikube docker-env)
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# Deploy (database first!)
kubectl apply -f k8s/database/
kubectl get pods -w   # wait for postgres-0 to be Running

# Create tasks table
kubectl exec -it postgres-0 -- psql -U postgres -d taskdb -c "
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# Deploy backend and frontend
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/

# Access the app
minikube service frontend-service
```

**Health Probes on Backend:**
```yaml
livenessProbe:   # Is the pod alive? If fails → K8s RESTARTS it
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:  # Is the pod ready? If fails → K8s stops sending traffic
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 5
  periodSeconds: 5
```

**Proven in practice:**
```bash
# Self-healing test
kubectl delete pod <backend-pod-name>
kubectl get pods -w   # watch K8s recreate it automatically

# Scaling test
kubectl scale deployment backend --replicas=5
kubectl get pods      # see 5 backend pods

# Data persistence test
kubectl delete pod postgres-0
kubectl get pods -w   # watch it restart
kubectl exec -it postgres-0 -- psql -U postgres -d taskdb -c "SELECT * FROM tasks;"
# All data still there!
```

---

### Phase 5 — Jenkins CI/CD

**Goal:** Automate the entire build-push process on every code push.

**Pipeline stages:**

```
GitHub Push
     ↓
Stage 1: Checkout    → Pull latest code from GitHub
     ↓
Stage 2: Test        → Run npm install + test suite
     ↓
Stage 3: Build       → Build Docker images tagged with build number
     ↓
Stage 4: Push        → Push versioned images to DockerHub
     ↓
Stage 5: Deploy      → Update Kubernetes deployments
```

**Run Jenkins with Docker:**
```bash
docker run -d \
  --name jenkins \
  --user root \
  --network host \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(which kubectl):/usr/local/bin/kubectl \
  -v /home/user/.minikube:/home/user/.minikube \
  -v /home/user/.kube:/home/user/.kube \
  custom-jenkins:latest
```

**Custom Jenkins Dockerfile** (bakes in all required tools):
```dockerfile
FROM jenkins/jenkins:lts
USER root
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs docker.io
USER jenkins
```

**Image versioning:**
Each build creates:
- `ashenellawala/todo-backend:15` ← build number tag (for rollbacks)
- `ashenellawala/todo-backend:latest` ← always points to newest

**Trigger:** Poll SCM every 5 minutes (local). Production uses GitHub Webhooks.

> **Note:** In local Minikube setup, Jenkins cannot reach the Kubernetes API server due to network isolation between Docker containers. The deploy stage is non-blocking (`|| true`). In production on AWS EKS, the API server has a public endpoint and the full pipeline including K8s deploy works automatically.

---

## Problems Faced & How I Solved Them

### ❌ Problem 1 — Backend Can't Connect to Database
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Cause:** PostgreSQL container was not running when backend started.

**Fix:** Start PostgreSQL container first, then start the backend. In Docker Compose, use `depends_on` with a healthcheck. In Kubernetes, use readiness probes.

---

### ❌ Problem 2 — Password Authentication Failed
```
Error: password authentication failed for user "postgres"
```
**Cause:** Typo in docker run command — `POSTGRESS_USER` (double S) instead of `POSTGRES_USER`.

**Fix:** Stop and remove the wrong container, re-run with correct spelling.
```bash
docker stop postgress-db
docker rm postgress-db
# Re-run with correct POSTGRES_USER
```

---

### ❌ Problem 3 — Frontend Says "Cannot Connect to Backend" in Kubernetes
**Cause:** `nginx.conf` had `proxy_pass http://backend:5000` but the Kubernetes service was named `backend-service`. Nginx couldn't resolve the hostname `backend`.

**Fix:** Update nginx.conf to match the exact Kubernetes service name:
```nginx
proxy_pass http://backend-service:5000;  # must match K8s service name exactly
```
Then rebuild the frontend image and restart the deployment.

---

### ❌ Problem 4 — Kubernetes Service Selector Mismatch
**Cause:** Backend `Service` had `selector: name: backend` but `Deployment` labeled pods with `app: backend`. The service couldn't find any pods.

**Fix:** Update service.yaml selector to match deployment labels exactly:
```yaml
# Wrong
selector:
  name: backend

# Correct
selector:
  app: backend   ← must match Deployment pod labels
```

---

### ❌ Problem 5 — Tasks Table Does Not Exist in Kubernetes
```
Error: relation "tasks" does not exist
```
**Cause:** Docker Compose used `init.sql` mounted as a volume to auto-create the table. Kubernetes had no equivalent — database started empty.

**Fix:** Manually create the table after deploying:
```bash
kubectl exec -it postgres-0 -- psql -U postgres -d taskdb -c "
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"
```
**Production fix:** Use database migration tools like Flyway or Liquibase.

---

### ❌ Problem 6 — Jenkins Pipeline: npm not found / docker not found
```
Error: npm: not found
Error: docker: not found
```
**Cause:** Jenkins runs inside a Docker container that only has Java installed. Node.js and Docker CLI were not pre-installed.

**Fix:** Built a custom Jenkins Docker image with tools pre-installed:
```dockerfile
FROM jenkins/jenkins:lts
USER root
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs docker.io
USER jenkins
```

---

### ❌ Problem 7 — Jenkins Cannot Reach Kubernetes API Server
```
Error: dial tcp 192.168.49.2:8443: i/o timeout
```
**Cause:** Minikube runs at an internal IP (192.168.49.2) only accessible from the host machine. Jenkins inside Docker is on a separate network and cannot reach it.

**Fix (local):** Made the deploy stage non-blocking with `|| true` so the pipeline still shows success for build and push stages.

**Real fix (production):** In AWS EKS/GKE/AKS, the Kubernetes API server has a public endpoint. Jenkins can reach it directly — this problem does not exist in cloud deployments.

---

### ❌ Problem 8 — Kubernetes Pods Stuck in Pending
```
Warning: 0/1 nodes are available: 1 Insufficient cpu
```
**Cause:** Running Minikube inside VirtualBox with limited CPU. Resource requests in pod specs exceeded available CPU.

**Fix:** Reduced CPU requests to minimum:
```yaml
resources:
  requests:
    cpu: "25m"      ← reduced from 100m
    memory: "64Mi"
  limits:
    cpu: "100m"
    memory: "128Mi"
```
Also removed dev namespace which doubled resource usage on local machine.

---

### ❌ Problem 9 — kubeconfig Certificate Paths Not Found in Jenkins
```
Error: unable to read client-cert /home/user/.minikube/client.crt: no such file
```
**Cause:** Kubeconfig referenced certificate files on the host machine. Those paths don't exist inside the Jenkins container.

**Fix:** Mount minikube and kube directories into Jenkins container:
```bash
-v /home/user/.minikube:/home/user/.minikube \
-v /home/user/.kube:/home/user/.kube \
```

---

### ❌ Problem 10 — Docker Image Tag Using Uppercase Username
```
Error: failed to do request: lookup AshenEllawala
```
**Cause:** DockerHub requires all-lowercase usernames in image tags. `AshenEllawala/todo-backend` failed — Docker treated it as a URL.

**Fix:** Use lowercase in Jenkinsfile:
```groovy
DOCKERHUB_USERNAME = 'ashenellawala'  // all lowercase
BACKEND_IMAGE = "docker.io/${DOCKERHUB_USERNAME}/todo-backend"
```

---

## Quick Start Guide

### Option 1 — Docker Compose (Easiest)

```bash
# Clone repository
git clone https://github.com/AshenEllawala/three-tier-app.git
cd three-tier-app

# Start all 3 tiers
docker-compose up --build

# Access app
open http://localhost
```

### Option 2 — Kubernetes (Minikube)

```bash
# Start Minikube
minikube start --driver=docker

# Build images inside Minikube
eval $(minikube docker-env)
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# Deploy database first
kubectl apply -f k8s/database/
kubectl get pods -w   # wait for postgres-0 Running

# Create database table
kubectl exec -it postgres-0 -- psql -U postgres -d taskdb -c "
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# Deploy backend and frontend
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/

# Open app
minikube service frontend-service
```

### Startup Script (After VM Restart)

```bash
#!/bin/bash
minikube start --driver=docker
docker start jenkins
kubectl get pods
echo "Jenkins: http://localhost:8080"
```

---

## API Endpoints

| Method | Endpoint | Description | Response |
|--------|---------|-------------|----------|
| `GET` | `/health` | Health check for K8s probes | `{ status: "OK" }` |
| `GET` | `/api/tasks` | Get all tasks | Array of tasks |
| `POST` | `/api/tasks` | Create a task | `{ id, name, completed, created_at }` |
| `PUT` | `/api/tasks/:id` | Toggle complete/incomplete | Updated task |
| `DELETE` | `/api/tasks/:id` | Delete a task | `{ message: "deleted" }` |

---

## CI/CD Pipeline

```
GitHub Push
     ↓ (Poll SCM every 5 min)
Jenkins Pipeline
     ↓
┌─────────────────────────────────────┐
│  Stage 1: Checkout                  │
│  → git pull from GitHub             │
├─────────────────────────────────────┤
│  Stage 2: Test Backend              │
│  → npm install + run tests          │
├─────────────────────────────────────┤
│  Stage 3: Build Docker Images       │
│  → todo-backend:BUILD_NUMBER        │
│  → todo-frontend:BUILD_NUMBER       │
├─────────────────────────────────────┤
│  Stage 4: Push to DockerHub         │
│  → Versioned tag + :latest          │
├─────────────────────────────────────┤
│  Stage 5: Deploy                    │
│  → kubectl set image (production)   │
└─────────────────────────────────────┘
```

**DockerHub images:**
- `ashenellawala/todo-backend`
- `ashenellawala/todo-frontend`

---

## Key Achievements Proven

| Achievement | How Proven | Result |
|-------------|-----------|--------|
| **Self-healing** | `kubectl delete pod <backend-pod>` | K8s recreated pod in ~10 seconds |
| **Scaling** | `kubectl scale deployment backend --replicas=5` | 5 pods running in seconds |
| **Data persistence** | `kubectl delete pod postgres-0` | All data intact after restart |
| **Image optimization** | Multi-stage Dockerfile | 900MB → 150MB (83% reduction) |
| **CI/CD automation** | Push code → pipeline runs | DockerHub updated automatically |
| **Health probes** | Kill process inside pod | K8s restarted pod automatically |

---

## Environment Variables

Create `backend/.env` from the template:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=5000
DB_HOST=localhost        # use 'database' in Docker Compose, 'postgres-service' in K8s
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=taskdb
DB_PORT=5432
```

> ⚠️ Never commit `.env` to GitHub. It's in `.gitignore`.

---

## Local vs Production Comparison

| Feature | Local (Minikube) | Production (AWS EKS) |
|---------|-----------------|---------------------|
| Cluster | Single node VM | Multiple cloud nodes |
| LoadBalancer | Pending (no cloud) | Real IP assigned |
| Jenkins → K8s | Network issues | Direct API access |
| Namespaces | CPU limited | Full isolation |
| Webhook trigger | Poll SCM (5min) | Instant on push |
| Database | PostgreSQL in K8s | AWS RDS managed |

---

## Credits

- **Project Supervision & Guidance:** [Claude AI by Anthropic](https://anthropic.com) — acted as project supervisor, guided architecture decisions, explained concepts and helped debug issues step by step.
- **Frontend UI:** React frontend components were generated with Claude AI assistance.
- **All DevOps configuration, Dockerfiles, Kubernetes YAML, Jenkinsfile, debugging and problem-solving** was done hands-on by the author.

---

## Author

**Ashen Ellawala**
- GitHub: [github.com/AshenEllawala](https://github.com/AshenEllawala)
- DockerHub: [hub.docker.com/u/ashenellawala](https://hub.docker.com/u/ashenellawala)

---

*Built to learn DevOps the hard way — by facing and solving real production problems.*
