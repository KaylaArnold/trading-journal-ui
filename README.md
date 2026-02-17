📈 Trading Journal — Frontend

Frontend client for a secure, production-ready full-stack trading journal application.

Built with React + Vite, this client communicates with a JWT-protected REST API and enforces strong client-side normalization before sending data to the backend.

🌐 Live Application

Frontend
https://trading-journal-ui-e3ac.onrender.com

Backend API
https://trading-journal-api-qya8.onrender.com

Backend Repository
👉 https://github.com/KaylaArnold/trading-journal-api

🏗 Architecture

This project follows a clean separation of concerns across two repositories:

Frontend (React + Vite)

SPA routing (React Router)

Axios API client with JWT interceptor

Protected routes

Modal-based editing

Client-side normalization

Environment-based configuration

Backend (Express + Prisma + PostgreSQL)

REST API

JWT authentication

Ownership enforcement

Zod request validation

PostgreSQL persistence

🧠 Data Flow (High-Level)

User registers/logs in → receives JWT

Frontend stores token in localStorage

Axios interceptor attaches:

Authorization: Bearer <JWT_TOKEN>


Backend verifies token (requireAuth)

Queries are scoped to the authenticated user

Data is validated (Zod) and persisted (Prisma)

UI refreshes after mutations

🔐 Security & Validation
Authentication

JWT-based authentication

All protected endpoints require Authorization: Bearer <token>

Unauthorized responses handled gracefully in UI

Authorization / Ownership Enforcement

Backend enforces user-scoped queries

Prevents horizontal privilege escalation

Example backend pattern:

where: { id, userId }

Client-Side Normalization

Before data is sent to the backend:

Time inputs normalized to HH:MM

Numeric fields safely coerced

Empty PATCH bodies prevented

Enum values normalized (CALL, PUT, GREEN, RED)

Invalid payload shapes filtered

Example:

normalizeTimeHM("9:30 AM") → "09:30"


This reduces avoidable validation errors and improves UX.

🧱 API Overview (REST)
Auth

POST /auth/register

POST /auth/login

Daily Logs

POST /daily-logs

GET /daily-logs

GET /daily-logs/:id

PUT /daily-logs/:id

DELETE /daily-logs/:id

Trades

POST /daily-logs/:id/trades

PATCH /trades/:tradeId

DELETE /trades/:tradeId

⚙️ Environment Configuration

Create a .env file locally:

VITE_API_URL=http://localhost:3000


Production environment must set:

VITE_API_URL=https://trading-journal-api-qya8.onrender.com


No secrets are stored in the frontend repository.

🛠 Run Locally
npm install
npm run dev

👤 Demo Access

For security reasons, demo credentials are not publicly shared.

To explore the app:

Visit the live site

Register a new account

Create daily logs and trades

All data is scoped to your account.

🧩 Notable Engineering Decisions

Separate frontend/backend repositories

Strict server-side validation (Zod)

Ownership enforcement on all queries

Environment-based configuration

Structured error responses

Modular API client layer

Modal-driven edit architecture

Explicit normalization layer before API calls

🔮 Future Improvements

Refresh token flow

Role-based access control (RBAC)

UI loading skeletons

Component-level tests (Vitest / RTL)

E2E testing (Playwright)

Accessibility refinements (ARIA, keyboard focus management)
