# 3-Tier Todo App
## Stack: React · Node.js · PostgreSQL · Docker · Kubernetes · Jenkins

---

## Project Structure

```
three-tier-app/
├── frontend/              ← Tier 1 — React App
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskForm.js
│   │   │   ├── TaskList.js
│   │   │   └── TaskItem.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── .gitignore
│   └── package.json
│
├── backend/               ← Tier 2 — Node.js API
│   ├── src/
│   │   ├── index.js
│   │   ├── db.js
│   │   └── routes.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── k8s/                   ← Kubernetes manifests (Week 3-4)
├── jenkins/               ← Jenkins pipeline (Week 4-5)
└── docker-compose.yml     ← Added in Week 2
```

---

## API Endpoints

| Method | Endpoint         | Description       |
|--------|-----------------|-------------------|
| GET    | /api/tasks       | Get all tasks     |
| POST   | /api/tasks       | Create a task     |
| PUT    | /api/tasks/:id   | Toggle complete   |
| DELETE | /api/tasks/:id   | Delete a task     |
| GET    | /health          | Health check      |

---

## Running Locally (Week 1)

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```
