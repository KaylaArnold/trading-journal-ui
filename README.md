# 📈 Trading Journal — Frontend

Frontend client for a secure, production-ready full-stack trading journal application.

Built with **React + Vite**, this client communicates with a JWT-protected REST API and applies strong client-side normalization before sending data to the backend.

---

# 🌐 Live Application

**Frontend**  
https://trading-journal-ui-e3ac.onrender.com  

**Backend API**  
https://trading-journal-api-qya8.onrender.com  

**Backend Repository**  
https://github.com/KaylaArnold/trading-journal-api  

---

# 🏗 Architecture

## Frontend (React + Vite)

- SPA routing (React Router)
- Axios API client with JWT interceptor
- Protected routes
- Modal-based editing
- Client-side normalization layer
- Environment-based configuration

## Backend (Express + Prisma + PostgreSQL)

- REST API
- JWT authentication
- Ownership enforcement
- Zod validation
- PostgreSQL persistence

---

# 🧠 Data Flow

1. User registers/logs in → receives JWT  
2. Frontend stores token in `localStorage`  
3. Axios interceptor attaches:

```
Authorization: Bearer <JWT_TOKEN>
```

4. Backend verifies token (`requireAuth`)  
5. Queries are scoped to authenticated user  
6. Data validated (Zod) and persisted (Prisma)  
7. UI refreshes after mutations  

---

# 🔐 Security & Validation

## Authentication

- JWT-based authentication
- All protected endpoints require `Authorization: Bearer <token>`
- Unauthorized responses handled gracefully in UI

## Authorization / Ownership Enforcement

- Backend enforces user-scoped queries
- Prevents horizontal privilege escalation

Example backend pattern:

```js
where: { id, userId }
```

## Client-Side Normalization

Before sending data to the backend:

- Time inputs normalized to `HH:MM`
- Numeric fields safely coerced
- Empty PATCH bodies prevented
- Enum values normalized (`CALL`, `PUT`, `GREEN`, `RED`)
- Invalid payload shapes filtered

Example:

```
normalizeTimeHM("9:30 AM") → "09:30"
```

This reduces avoidable validation errors and improves UX.

---

# 🧱 API Overview

## Auth

```
POST /auth/register
POST /auth/login
```

## Daily Logs

```
POST   /daily-logs
GET    /daily-logs
GET    /daily-logs/:id
PUT    /daily-logs/:id
DELETE /daily-logs/:id
```

## Trades

```
POST   /daily-logs/:id/trades
PATCH  /trades/:tradeId
DELETE /trades/:tradeId
```

---

# ⚙️ Environment Configuration

Create a local `.env` file:

```
VITE_API_URL=http://localhost:3000
```

Production environment must set:

```
VITE_API_URL=https://trading-journal-api-qya8.onrender.com
```

No secrets are stored in the frontend repository.

---

# 🛠 Run Locally

```
npm install
npm run dev
```

---

# 👤 Demo Access

Demo credentials are not publicly shared.

To explore the app:

1. Visit the live site
2. Register a new account
3. Create daily logs and trades

All data is scoped to your account.

---

# 🧩 Engineering Decisions

- Separate frontend and backend repositories
- Strict server-side validation (Zod)
- Ownership enforcement on all queries
- Explicit client-side normalization layer
- Modular Axios API client
- Modal-driven edit architecture
- Environment-based configuration

---

# 🔮 Future Improvements

- Refresh token flow
- Role-based access control (RBAC)
- UI loading skeletons
- Component-level testing (Vitest / React Testing Library)
- End-to-end testing (Playwright)
- Accessibility refinements (ARIA, keyboard focus management)
