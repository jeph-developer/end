# SwiftWheel Fleet Management System — MySQL Version

## Project Structure

```
SwiftWheel_FMS_MySQL/
├── backend-project/        # Node.js + Express + MySQL API
│   ├── config/
│   │   ├── db.js           # mysql2 connection pool
│   │   └── schema.sql      # SQL schema — run this first!
│   ├── routes/             # API routes (auth, vehicles, trips, maintenance, reports)
│   ├── middleware/auth.js  # Session-based auth guard
│   ├── server.js           # Express app entry point
│   └── .env                # Environment variables
└── frontend-project/       # React.js + Vite + Tailwind CSS
    └── src/
        ├── pages/          # Login, Vehicles, Trips, Maintenance, Reports
        ├── components/     # Navbar
        ├── api.js          # Axios instance with interceptors
        └── App.jsx         # Router + auth state
```

## Requirements

- Node.js v18+
- MySQL Server (running locally on port 3306)

---

## Setup & Run

### 1. Create the Database
Open MySQL and run the schema file:
```sql
source /path/to/backend-project/config/schema.sql
```
Or import it via MySQL Workbench / phpMyAdmin.

### 2. Update .env
Edit `backend-project/.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=swiftwheel_fms
SESSION_SECRET=swiftwheel_secret_2026
PORT=5000
```

### 3. Backend
```bash
cd backend-project
npm install
npm run dev
```
API runs at: http://localhost:5000

### 4. Frontend (new terminal)
```bash
cd frontend-project
npm install
npm run dev
```
App runs at: http://localhost:3000

---

## API Endpoints

| Method | Endpoint                       | Description                  |
|--------|-------------------------------|------------------------------|
| POST   | /api/auth/register             | Register new user            |
| POST   | /api/auth/login                | Login (starts session)       |
| POST   | /api/auth/logout               | Logout (destroys session)    |
| GET    | /api/auth/me                   | Check active session         |
| GET    | /api/vehicles                  | List all vehicles            |
| POST   | /api/vehicles                  | Add vehicle                  |
| GET    | /api/trips                     | List all trips               |
| POST   | /api/trips                     | Record new trip              |
| GET    | /api/maintenance               | List all maintenance records |
| POST   | /api/maintenance               | Add maintenance record       |
| PUT    | /api/maintenance/:id           | Update maintenance record    |
| DELETE | /api/maintenance/:id           | Delete maintenance record    |
| GET    | /api/reports/daily-trips?date= | Daily trip report            |
| GET    | /api/reports/fleet-status      | Fleet status report          |

## Features

- Session-based login/register (bcryptjs encrypted passwords, MySQL session store)
- **Vehicles** — Add & list vehicles (INSERT only per spec)
- **Trips** — Record & list trips (INSERT only per spec)
- **Maintenance** — Full CRUD (add, edit, delete, list)
- **Reports**
  - Daily Trip Report (filter by date, with summary totals)
  - Fleet Status Report (vehicle name, fuel consumed, maintenance status, availability)
- All SQL queries use camelCase aliases for seamless frontend integration
- Axios interceptors for request/response debugging

## Database Tables

- `users` — username + hashed password
- `vehicles` — vehicle_name, plate_number, model, fuel_type, capacity
- `trips` — vehicle_id (FK), driver, trip_date, destination, fuel_consumed, trip_cost
- `maintenance` — vehicle_id (FK), service_type, maintenance_cost, maintenance_date, vehicle_status
