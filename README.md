# Skill Exchange Platform

A MERN-based platform where users exchange skills, connect with learners, and schedule collaborative learning sessions.

Users can offer skills they know and request skills they want to learn, creating a community-driven knowledge-sharing environment.

## Tech Stack

**Frontend**
- React
- Vite
- React Router
- Axios

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## Project Structure

```text
skill-exchange/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── member/
│   │   │   └── admin/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or local MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd skill-exchange
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`.

Configure:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_generated_secret
```

Start the backend:

```bash
npm run dev
```

Backend runs at:

`http://localhost:5001`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file using `.env.example`.

Configure:

```env
VITE_API_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

Open the Vite URL shown in your terminal, usually:

`http://localhost:5173`

## Authentication and Authorization

- JWT-based authentication.
- Password hashing using bcryptjs.
- Public registration creates Member accounts.
- Admin accounts are provisioned separately.
- Role-based frontend route protection.
- Backend authentication and role authorization middleware.
- Session restoration using the `/api/auth/me` endpoint.

## Development Workflow

Both developers work in separate feature branches.

- `main` — stable, integrated code.
- `feature/member-*` — Member functionality.
- `feature/admin-*` — Admin functionality.

### Branch workflow

1. Pull the latest `main`.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit and push your branch.
5. Open a Pull Request to `main`.
6. Merge after review and testing.

Example:

```bash
git checkout main
git pull origin main
git checkout -b feature/admin-overview
```

## Developer Responsibilities

**Developer 1 — Member Platform**
- Profile management
- Skill discovery and matching
- Community
- Exchange requests
- Chat and resources
- Calendar and sessions

**Developer 2 — Admin Dashboard**
- Admin overview and analytics
- User management
- Verification management
- Skill and category management
- Exchange monitoring
- Reports and moderation

## Important Notes

- Never commit `.env` files, passwords, JWT secrets, or database credentials.
- Commit `.env.example` files with placeholder values.
- Do not expose admin registration publicly.
- All protected backend APIs must enforce authorization independently of frontend route protection.

---

**Project:** Skill Exchange Platform  
**Architecture:** MERN Stack  
**Development:** Collaborative feature-branch workflow