🖥️ FRONTEND REPO README

(trading-journal-ui/README.md)

📈 Trading Journal — Frontend

Frontend client for a secure full-stack trading journal application.

Built with React + Vite, this client communicates with a JWT-protected REST API and enforces clean UX validation before sending data to the backend.

🌐 Live Application

Frontend: https://trading-journal-ui-e3ac.onrender.com
Backend API: https://trading-journal-api-qya8.onrender.com

Backend repository:
👉 https://github.com/KaylaArnold/trading-journal-api

🏗 Frontend Architecture

React (Vite)

Axios API client

JWT interceptor

Protected routes

Modal-based editing

Optimistic UI refresh

Environment-based API configuration

🔐 Security Considerations
JWT Handling

Token stored in localStorage

Axios interceptor automatically attaches:

Authorization: Bearer <JWT_TOKEN>


Unauthorized responses handled gracefully

Client-Side Validation

Before sending data to the backend:

Time inputs normalized to HH:MM

Numeric fields coerced safely

Empty PATCH bodies prevented

Enums normalized (CALL/PUT, GREEN/RED)

Example:

normalizeTimeHM("9:30 AM") → "09:30"


This prevents avoidable backend validation failures.

🧠 State & API Flow

Example: Creating a trade

User enters trade data

Input normalized client-side

POST request sent to:

POST /daily-logs/:id/trades


On success:

Local UI refresh triggered

Analytics cache invalidated

Trade table re-renders

⚙️ Environment Variables

Create .env:

VITE_API_URL=http://localhost:3000


Production environment must set:

VITE_API_URL=https://trading-journal-api-qya8.onrender.com

🛠 Run Locally
npm install
npm run dev

🔮 Future Improvements

Refresh token flow

UI loading skeletons

Component-level unit tests

Accessibility improvements
