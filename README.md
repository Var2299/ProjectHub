# ProjectHub

A small team project & task management app with role-based access control.

## Stack
- Next.js 14 (App Router) + TypeScript
- MongoDB with Mongoose
- JWT auth in httpOnly cookies
- Tailwind CSS

## Roles
- **admin** — full access, can manage users and all projects
- **manager** — can create projects and assign tasks
- **member** — can view assigned projects and update own tasks

## Setup

```bash
npm install
cp .env.example .env
# fill MONGODB_URI and JWT_SECRET
npm run dev
```

Open http://localhost:3000

The first user you register becomes an **admin** automatically.
Subsequent users register as **member** by default. Admin can promote them.

## Features
- Register / Login / Logout (JWT, bcrypt)
- Role-based dashboard with stats
- Projects: create, list, view, edit, delete, add members
- Tasks: create within a project, assign, set priority/status, edit, delete
- User management (admin only)
- Form validation with Zod, loading and empty states, responsive UI

## API Routes

### Auth
- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET  /api/auth/me` — current user

### Projects
- `GET    /api/projects` — list (admin: all, others: own/member)
- `POST   /api/projects` — create (admin, manager)
- `GET    /api/projects/:id`
- `PUT    /api/projects/:id` — update (admin, owner)
- `DELETE /api/projects/:id` — delete (admin, owner)

### Tasks
- `GET    /api/tasks?projectId=...` — list tasks
- `POST   /api/tasks` — create (admin, manager)
- `PUT    /api/tasks/:id` — update (admin, manager, assignee for status)
- `DELETE /api/tasks/:id` — delete (admin, manager)

### Users (admin only, except `/me`)
- `GET    /api/users`
- `PUT    /api/users/:id` — change role
- `DELETE /api/users/:id`

### Stats
- `GET /api/stats` — dashboard counts

## Folder Structure
```
src/
  app/
    api/             # REST endpoints
    login/  register/  dashboard/  projects/  tasks/  users/
  components/        # UI components
  lib/               # db, auth, utils
  models/            # Mongoose models
  types/             # TS types
```
