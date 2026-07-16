# PisoPilot

PisoPilot is a mobile-first personal finance manager built with Expo, React Native, Express, Prisma, and PostgreSQL. It helps users track income, expenses, budgets, savings goals, allowance/baon plans, bills, reports, and AI-assisted spending decisions.

The app is designed for Philippine peso budgeting and includes PisoPilot AI features for expense categorization, budget advice, spending priority recommendations, receipt scanning, and monthly insights.

## Tech Stack

**Frontend**

- Expo Router
- React Native
- TypeScript
- React Native Paper
- Zustand
- Axios
- Expo SecureStore
- Expo Image Picker
- Expo Sharing

**Backend**

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Bcrypt password hashing
- Multer uploads
- OpenAI API integration

**Database / Deployment**

- PostgreSQL locally or Neon PostgreSQL
- Render for backend deployment
- EAS Build for Android APK

## Main Features

- Account registration and login
- JWT authentication with access and refresh tokens
- Dashboard with live finance summary
- Income tracking
- Expense tracking
- AI expense category suggestion
- AI receipt scan
- Budget tracking and budget usage graph
- AI budget recommendation
- Savings goals with target date presets
- Baon / allowance planner with monthly calendar
- Bills and recurring money reminders
- Reports with income, expense, savings, and category breakdown
- PDF and CSV report export
- Profile update
- Change password
- Dark mode setting

Debt Tracker was removed from the app UI/API route because it is not needed for the current project scope.

## Folder Structure

```text
Personal Finance Manager/
|-- frontend/          Expo + React Native mobile app
|-- backend/           Express + Prisma REST API
|-- database/          PostgreSQL setup notes
|-- docs/              API and roadmap docs
|-- package.json       npm workspace scripts
`-- README.md
```

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL local database or Neon PostgreSQL
- Expo Go for local mobile testing, or EAS Build for APK
- Optional: OpenAI API key for AI features

## Environment Variables

Create `backend/.env`.

For local PostgreSQL:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/financedb?schema=public"
JWT_ACCESS_SECRET="replace-with-long-random-text"
JWT_REFRESH_SECRET="replace-with-another-long-random-text"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:8081"
UPLOAD_DIR="src/uploads"
OPENAI_MODEL="gpt-4.1-mini"
OPENAI_API_KEY="your-openai-api-key"
```

For Render + Neon:

```env
NODE_ENV=production
DATABASE_URL="your-neon-postgresql-connection-string"
JWT_ACCESS_SECRET="replace-with-long-random-text"
JWT_REFRESH_SECRET="replace-with-another-long-random-text"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="*"
OPENAI_MODEL="gpt-4.1-mini"
OPENAI_API_KEY="your-openai-api-key"
```

Never commit real secrets or API keys.

## Installation

Run this from the project root:

```powershell
cd "C:\Users\jhonr\Desktop\Personal Finance Manager"
npm.cmd install
npm.cmd run prisma:generate --workspace backend
```

## Database Setup

If using local PostgreSQL, create a database named `financedb`.

Then run:

```powershell
cd "C:\Users\jhonr\Desktop\Personal Finance Manager"
npm.cmd run prisma:migrate --workspace backend
npm.cmd run seed --workspace backend
```

If using Neon PostgreSQL, update `DATABASE_URL` first, then run the same Prisma migrate command.

## Run Locally

Open two terminals.

Terminal 1, backend:

```powershell
cd "C:\Users\jhonr\Desktop\Personal Finance Manager"
npm.cmd run dev:backend
```

Backend should show:

```text
PisoPilot API running on port 4000
```

Terminal 2, frontend:

```powershell
cd "C:\Users\jhonr\Desktop\Personal Finance Manager"
npm.cmd run dev:frontend
```

Then scan the Expo QR code using Expo Go.

Important: `dev:backend` and `dev:frontend` are root workspace scripts. If you are already inside `backend`, use `npm.cmd run dev`. If you are already inside `frontend`, use `npm.cmd run start`.

## Backend Deployment On Render

Recommended Render settings:

```text
Language: Node
Branch: main
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

Required Render environment variables:

```env
NODE_ENV=production
DATABASE_URL="your-neon-postgresql-connection-string"
JWT_ACCESS_SECRET="replace-with-long-random-text"
JWT_REFRESH_SECRET="replace-with-another-long-random-text"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="*"
OPENAI_MODEL="gpt-4.1-mini"
OPENAI_API_KEY="your-openai-api-key"
```

Current backend URL used by the app:

```text
https://personal-finance-manager-w188.onrender.com/api
```

Health check:

```text
https://personal-finance-manager-w188.onrender.com/api/health
```

## Android APK Build

The project includes `frontend/eas.json` with an APK preview profile.

From the frontend folder:

```powershell
cd "C:\Users\jhonr\Desktop\Personal Finance Manager\frontend"
npx eas build -p android --profile preview
```

After changing app name, splash screen, logo, colors, API URL, or native dependencies, rebuild the APK before installing it again on your phone.

## How To Use The App

1. Create an account or log in.
2. Add income records such as salary, allowance, freelance income, or business income.
3. Add expenses such as food, transport, bills, shopping, or school expenses.
4. Use AI category suggestion when creating expenses.
5. Create monthly budgets per category.
6. Check the Dashboard to see balance, savings, budget usage, recent transactions, and upcoming items.
7. Add savings goals with target amount, saved amount, and target date.
8. Use Baon Planner to estimate weekday allowance and monthly savings.
9. Add bill reminders and recurring transactions.
10. Open Reports to view monthly summaries and export PDF or CSV files.
11. Use Profile to update your name, change password, and adjust app settings.

## What Is Not Fully Implemented Yet

- Forgot Password is still a placeholder. It does not send a real reset email yet.
- Notifications toggle is only a setting. Real push notifications are not implemented yet.
- Profile avatar upload is not fully implemented.
- AI features require a valid OpenAI API key and available quota.
- Receipt image files on Render may not be permanent unless persistent storage or cloud storage is added.
- PDF/CSV export should be tested on the final APK share sheet after every rebuild.

## Validation Commands

Run these before committing or deploying:

```powershell
cd "C:\Users\jhonr\Desktop\Personal Finance Manager"
npm.cmd run typecheck --workspace frontend
npm.cmd run lint --workspace frontend
npm.cmd run build --workspace backend
npm.cmd run lint --workspace backend
```

Root combined checks:

```powershell
npm.cmd run build
npm.cmd run lint
```

## Useful Prisma Commands

```powershell
npm.cmd run prisma:generate --workspace backend
npm.cmd run prisma:migrate --workspace backend
npm.cmd run prisma:studio --workspace backend
npm.cmd run seed --workspace backend
```

## Portfolio Summary

PisoPilot is a full-stack AI personal finance manager that tracks income, expenses, budgets, savings goals, allowance planning, recurring bills, and reports. It uses a mobile Expo frontend, an Express REST API, JWT authentication, Prisma ORM, PostgreSQL/Neon, and OpenAI-powered financial insights.
