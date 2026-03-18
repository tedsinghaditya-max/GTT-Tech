# Fleet Management SaaS

Starter full-stack SaaS app for fleet management with:

- Node.js + Express backend
- React frontend
- PostgreSQL database

## Project Structure

```text
fleet-management-saas/
|-- client/       # React frontend
|-- server/       # Express API
|-- database/     # PostgreSQL schema and seed files
|-- package.json  # Workspace scripts
```

## Core Modules

- Authentication and login
- Dashboard metrics
- Bus management
- Diesel tracking
- Driver management

## Quick Start

1. Install dependencies from the project root:

   ```bash
   npm run install:all
   ```

2. Copy the environment templates:

   ```bash
   copy server\\.env.example server\\.env
   copy client\\.env.example client\\.env
   ```

3. Create the PostgreSQL database and run:

   ```bash
   psql -U postgres -f database/schema.sql
   psql -U postgres -f database/seed.sql
   ```

4. Start the apps in separate terminals:

   ```bash
   npm run dev:server
   npm run dev:client
   ```

## Default Login

- Email: `admin@fleetflow.com`
- Password: `Admin@123`

## Notes

- The backend is wired for PostgreSQL but includes fallback demo responses so the UI can be developed before the database is fully connected.
- Authentication uses JWT tokens stored in local storage in this starter.

