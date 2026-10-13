# 📖 YOM — Social Journaling Platform

> **"Write your day. Read theirs."**  
> One journal entry a day. Build a daily journaling habit, connect with friends, and discover their daily reflections.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Overview

**YOM** is a full-stack social journaling web application built to make personal reflection a shared, habit-forming experience. By introducing an intentional constraint (**one entry per day**), YOM encourages deliberate reflection while keeping personal updates concise and meaningful.

---

## ✨ Features

- ✍️ **Daily Journaling** — Post one reflection per day with custom length constraints to promote consistency.
- 👥 **Friend Management** — Search users by username, send friend requests, accept, or reject incoming requests.
- 📰 **Social Feed** — View a chronological stream of daily journal entries authored by connected friends.
- 📖 **Personal Archive ("My Journey")** — Revisit and browse your historical journal entries ordered by date.
- 🔐 **Secure Authentication** — JWT-based authentication featuring token expiration, password hashing (`bcryptjs`), and protected routes.
- 🛡️ **Robust Validation** — Two-tiered input validation using client-side validation hooks and server-side schema verification with `Zod`.

---

## 🛠️ Tech Stack

### Frontend
- **Framework & Runtime**: React 19, Vite
- **Routing**: React Router 7 (`react-router`)
- **State Management**: React Context API (`AuthContext`) + Custom Hooks (`useHttpClient`, `useForm`)
- **Styling**: Vanilla CSS (Modular & Responsive)

### Backend
- **Server**: Node.js & Express 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Validation**: `Zod` schemas for request body sanitization and validation
- **Security & Middleware**: `cors` with configurable origin control, custom HTTP error handler

---

## 📐 Architecture & Design

```
yom/
├── backend/
│   ├── controllers/      # Business logic (users, journals, friends)
│   ├── middleware/       # JWT auth verification middleware (check-auth)
│   ├── models/           # Mongoose schemas (User, Journal, Friendship)
│   ├── routes/           # Express REST endpoints
│   ├── schemas/          # Zod request validation schemas
│   └── app.js            # Server configuration & DB connection
│
├── frontend/
│   └── YOM/
│       ├── public/       # Static assets & icons
│       └── src/
│           ├── journals/ # Journal views (Feed, NewJournal, MyJournals)
│           ├── user/     # User views (Auth, Search, UserFriends, FriendRequests)
│           ├── shared/   # Reusable UI elements, hooks, context, and utils
│           └── App.jsx   # Root component with routing and auth guards
```

---

## 📡 API Endpoints Reference

### 🔑 Authentication & Users (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/users/signup` | Create a new user account | ❌ No |
| `POST` | `/api/users/login` | Authenticate existing user & issue JWT | ❌ No |
| `GET` | `/api/users` | List all users | ❌ No |
| `GET` | `/api/users/search?username=` | Search users by username query | ❌ No |

### 📝 Journals (`/api/journals`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/journals/today` | Check if authenticated user posted today | 🔒 Yes |
| `GET` | `/api/journals/feed` | Retrieve today's feed from accepted friends | 🔒 Yes |
| `GET` | `/api/journals/user/:uid` | Retrieve all journals by a specific user ID | 🔒 Yes |
| `GET` | `/api/journals/:jid` | Retrieve single journal by journal ID | 🔒 Yes |
| `POST` | `/api/journals` | Create a new journal entry for today | 🔒 Yes |

### 🤝 Friendships (`/api/friends`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/friends` | Get authenticated user's friends list | 🔒 Yes |
| `GET` | `/api/friends/pending` | Get sent and received pending requests | 🔒 Yes |
| `POST` | `/api/friends/:uid` | Send a friend request to user ID | 🔒 Yes |
| `PATCH` | `/api/friends/:uid/accept` | Accept an incoming friend request | 🔒 Yes |
| `DELETE` | `/api/friends/:uid` | Cancel request or remove friend | 🔒 Yes |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI (or local MongoDB daemon)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/yom.git
cd yom
```

### 2. Configure Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit `backend/.env` with your actual MongoDB connection string and a secret key:
```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 3. Configure Frontend
```bash
cd ../frontend/YOM
npm install
cp .env.example .env
```
Ensure `frontend/YOM/.env` points to your backend instance:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Run Locally
In separate terminal windows:

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend/YOM
npm run dev
```

Visit `http://localhost:5173` to explore the application!

---

## 🌐 Production Deployment

- **Frontend**: Can be hosted on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/) (pointing to `frontend/YOM`).
  - Environment variable: `VITE_API_URL=https://your-backend-service.onrender.com`
- **Backend**: Can be hosted on [Render](https://render.com/) or [Railway](https://railway.app/) (pointing to `backend/`).
  - Environment variables: `MONGO_URL`, `JWT_SECRET`, `CORS_ORIGIN=https://your-frontend.vercel.app`

---

## 👤 Author

**Firas Elshall**  
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- LinkedIn: [Your Profile](https://linkedin.com/in/YOUR_USERNAME)

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
