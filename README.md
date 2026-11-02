# Employee Management System (Backend)

Backend APIs for the **Zynvixs Pvt. Ltd. Backend Developer Intern** assignment.

The service manages employee records with JWT authentication, role-based access, input validation, and centralized error handling.

## Tech stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT (`jsonwebtoken`) + bcrypt
- Joi validation
- Jest + Supertest + MongoDB Memory Server

## Architecture

```
Request → Routes → Joi validators → Auth/RBAC → Controllers → Services → Mongoose → MongoDB
                                         ↘ Error middleware → JSON error
```

Controllers stay thin. Services hold business rules (duplicate email, pagination, self-access). A single error handler maps validation errors, duplicate keys, JWT failures, and unexpected errors to a consistent JSON body.

## Folder structure

```
src/
  config/          MongoDB connection
  models/          Employee schema
  controllers/     HTTP handlers
  services/        Business logic
  routes/          REST routes
  middlewares/     Auth, RBAC, errors
  validators/      Joi schemas
  utils/           ApiError, asyncHandler, responses
  app.js           Express app (used by tests)
server.js          Process entry
scripts/seed.js    Admin + sample employees
tests/             API tests
postman/           Postman collection
screenshots/       Demo screenshots
```

## Database schema

Collection: `employees`

| Field | Type | Rules |
|---|---|---|
| name | String | required, 2–80 chars |
| email | String | required, unique, lowercase |
| password | String | required, hashed, never returned |
| role | String | `admin` \| `employee` (default `employee`) |
| phone | String | optional 10-digit number |
| department | String | `Engineering`, `HR`, `Finance`, `Sales`, `Operations` |
| designation | String | required |
| salary | Number | min 0 |
| dateOfJoining | Date | default now |
| status | String | `active` \| `inactive` |
| address | String | optional |
| timestamps | Date | `createdAt`, `updatedAt` |

Indexes: unique `email`, compound `{ department, status }`.

Deletion is a hard delete (`DELETE /api/employees/:id`) as required by the assignment. Production systems often use a `deletedAt` flag instead.

## API endpoints

Base URL: `http://localhost:5000`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/health` | public | Health check |
| POST | `/api/auth/register` | public | Register (role always `employee`) |
| POST | `/api/auth/login` | public | Login, returns JWT |
| GET | `/api/auth/me` | logged in | Current profile |
| POST | `/api/employees` | admin | Create employee |
| GET | `/api/employees` | admin | List with search / filter / pagination |
| GET | `/api/employees/:id` | admin or self | Get one |
| PUT | `/api/employees/:id` | admin | Update |
| DELETE | `/api/employees/:id` | admin | Delete |

List query params: `page`, `limit`, `search` (name or email), `department`, `status`, `sort` (`-createdAt`, `name`, `salary`, ...).

Auth header: `Authorization: Bearer <token>`

Success:

```json
{ "success": true, "message": "Employee created", "data": {} }
```

Error:

```json
{ "success": false, "message": "Validation failed", "errors": ["Email is required"] }
```

HTTP status codes: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`.

## Setup

1. Install [Node.js 18+](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/try/download/community) (local) or use MongoDB Atlas.
2. Clone the repo and install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
copy .env.example .env
```

On macOS/Linux: `cp .env.example .env`

4. Set `MONGODB_URI` and a strong `JWT_SECRET` in `.env`.
5. Seed the database (creates an admin and sample employees):

```bash
npm run seed
```

Seeded admin:

- Email: `admin@zynvixs.com`
- Password: `Admin@123`

6. Start the server:

```bash
npm run dev
```

The API listens on `http://localhost:5000`.

## Tests

```bash
npm test
```

Tests use an in-memory MongoDB instance. They do not need a local MongoDB process.




1. Run **Login admin** (after seeding). The token is stored in a collection variable.
2. Run **Create employee**, **List**, **Get**, **Update**, **Delete**.
3. **Validation error example** and **Unauthorized example** show `400` and `401` responses.


