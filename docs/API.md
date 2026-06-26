# PesoPilot API

Base URL: `http://localhost:4000/api`

All private routes require:

```http
Authorization: Bearer <accessToken>
```

## Authentication

### POST `/auth/register`

```json
{
  "fullName": "Juan Dela Cruz",
  "email": "juan@example.com",
  "password": "Password123!"
}
```

### POST `/auth/login`

```json
{
  "email": "juan@example.com",
  "password": "Password123!"
}
```

### POST `/auth/refresh`

```json
{
  "refreshToken": "<refreshToken>"
}
```

### POST `/auth/logout`

Returns `204 No Content`.

## User

- `GET /user/profile`
- `PUT /user/profile`
- `PUT /user/change-password`

## Expenses

- `GET /expenses`
- `POST /expenses`
- `PUT /expenses/:id`
- `DELETE /expenses/:id`

Expense body:

```json
{
  "title": "Jollibee",
  "amount": 350,
  "category": "Food",
  "description": "Lunch",
  "transactionDate": "2026-06-26T00:00:00.000Z"
}
```

Receipt upload is supported with multipart form-data field `receipt`.

## Income

- `GET /income`
- `POST /income`
- `PUT /income/:id`
- `DELETE /income/:id`

Income body:

```json
{
  "source": "Salary",
  "amount": 65000,
  "description": "June payroll",
  "transactionDate": "2026-06-26T00:00:00.000Z"
}
```

## Budgets

- `GET /budgets`
- `POST /budgets`
- `PUT /budgets/:id`
- `DELETE /budgets/:id`

Budget body:

```json
{
  "category": "Food",
  "limitAmount": 12000,
  "month": "2026-06-01T00:00:00.000Z"
}
```

## Reports

- `GET /reports/monthly?month=2026-06`
- `GET /reports/category?month=2026-06`
- `GET /dashboard`

