
---

# ✅ Frontend README — `trading-journal-ui/README.md`

```md
# Trading Journal UI

A React + Vite frontend for the Trading Journal application.  
Includes login, daily log dashboard, daily log detail view, trade table + edit modal, and analytics dashboards.

## Features

- **Auth**
  - Login screen
  - Stores JWT in localStorage
  - Sends token via `Authorization: Bearer <token>`

- **Daily Logs Dashboard**
  - Paginated daily logs list
  - Click into log detail page

- **Daily Log Detail Page**
  - View log info (ticker/date)
  - Edit notes:
    - keyLevels
    - feelings
    - reflections
  - Add trades
  - Delete trades
  - Trade table with:
    - CALL/PUT badge
    - GREEN/RED badge
    - strategy badge (ORB15 / ORB5 / 3CONF)
    - color-coded P/L
    - additional columns (contracts, drip %, leveraged)

- **Trade Edit Modal**
  - Opens from the trade row
  - Prefills fields
  - PATCH update to backend
  - Updates UI after save

- **Analytics Page**
  - Summary cards
  - Weekly table
  - Strategy performance table
  - Date filters (From/To)
  - Refresh button

- **Navigation / UX**
  - React Router
  - Clickable “Trading Journal” title routes back to `/daily-logs`
  - Breadcrumbs:
    - `Dashboard › Log`
    - `Dashboard › Log › Trade` when a trade is selected

## Tech Stack

- React
- Vite
- React Router
- CSS (light custom component styling)

## Repo Structure

```txt
public/
src/
  api/
  assets/
  components/
  pages/

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/Dashboard.png)

### Daily Log
![Daily Log](./screenshots/DailyLogDetail.png)

### Analytics
![Analytics](./screenshots/Analytics.png)

### Edit Trade Modal
![Edit Trade](./screenshots/TradeEditModal.png)

