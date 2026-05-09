# ProjectHub

A small team project & task management app with role-based access control.

## Stack
- Next.js 14 (App Router) + TypeScript
- MongoDB with Mongoose
- JWT auth in httpOnly cookies
- Tailwind CSS

## Roles
- **admin** : full access, can manage users and all projects
- **manager** : can create projects and assign tasks
- **member** : can view assigned projects and update own tasks

## Features
- AI-Powered Task Descriptions: Use the "AI Suggest" button during task creation to automatically generate an optimal description based on your title.
- Role-based dashboard with stats
- Register / Login / Logout (JWT, bcrypt)
- Projects: create, list, view, edit, delete, add members
- Tasks: create within a project, assign, set priority/status, edit, delete
- User management (admin only)
- Form validation with Zod, loading and empty states, responsive UI

## Screenshots

### Login Page
<img width="1917" height="1012" alt="image" src="https://github.com/user-attachments/assets/f4419e8b-789f-4a98-8ac8-131033649621" />

---

### Register Page
<img width="1917" height="1020" alt="image" src="https://github.com/user-attachments/assets/819149e2-8f51-41bf-8adc-085ffdeba8f6" />

---

### Dashboard
<img width="1917" height="1020" alt="image" src="https://github.com/user-attachments/assets/5c1f2905-7da0-49b1-9f23-95a6e89bb1ff" />

---

### Projects
<img width="1532" height="532" alt="image" src="https://github.com/user-attachments/assets/f63419d7-5549-4d5e-ac12-b08260a0b5b2" />

---

### AI assisted task creation
<img width="737" height="777" alt="image" src="https://github.com/user-attachments/assets/f1d3354e-87a7-436a-b0eb-9043690008c0" />

---

### Loading Page
<img width="1536" height="480" alt="image" src="https://github.com/user-attachments/assets/0939fd1a-fb6d-406a-909b-1296fa3d8501" />

---

### Project Preview
<img width="1542" height="616" alt="image" src="https://github.com/user-attachments/assets/72a3660c-e84f-4ec0-81c1-2cfba8bd6832" />

---

### Task Preview
<img width="1582" height="472" alt="image" src="https://github.com/user-attachments/assets/72e32d35-cb84-42db-9f02-b82db83cb175" />

---

### User Panel
<img width="1507" height="522" alt="image" src="https://github.com/user-attachments/assets/74ed5ee3-800e-4cfc-aa4e-8bf17e85d2f5" />

---


## Setup

```bash
npm install
cp .env.example .env
# fill MONGODB_URI, JWT_SECRET AND GEMINI_API_KEY
npm run dev
```

Open http://localhost:3000

The first user you register becomes an **admin** automatically.
Subsequent users register as **member** by default. Admin can promote them.
