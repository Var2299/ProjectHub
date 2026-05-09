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
- AI-Powered Task Descriptions — Use the "AI Suggest" button during task creation to automatically generate an optimal description based on your title.
- Role-based dashboard with stats
- Register / Login / Logout (JWT, bcrypt)
- Projects: create, list, view, edit, delete, add members
- Tasks: create within a project, assign, set priority/status, edit, delete
- User management (admin only)
- Form validation with Zod, loading and empty states, responsive UI
