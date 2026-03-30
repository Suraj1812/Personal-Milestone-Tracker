# Personal Milestone Tracker

A production-ready milestone tracking app with a calm, product-focused UI and a full Express-backed CRUD flow.

## Tech Stack

- React 19 + TypeScript + Vite
- Express + TypeScript + Zod
- SWR for optimistic server-state synchronisation
- Standard CSS with a responsive, custom UI

## Features

- Create, edit, and delete milestones with optimistic updates
- Track milestones by date and filter by category or date range
- Lightweight feedback states for saving, updating, deleting, and errors
- SVG favicon, logo, and social preview metadata
- Production build served from one Node process

## Project Structure

```text
.
├── client   # React frontend
└── server   # Express API and production server
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the backend server

```bash
npm run dev:server
```

The API starts on `http://localhost:4000`.

### 3. Run the frontend application

In a second terminal:

```bash
npm run dev:client
```

The frontend starts on `http://localhost:5173`.

### 4. Run both together

```bash
npm run dev
```

## Available Scripts

- `npm run dev` starts the API and frontend together
- `npm run dev:server` starts the Express API with hot reload
- `npm run dev:client` starts the Vite frontend
- `npm run build` builds both the client and server for production
- `npm run start` serves the compiled frontend and API from the production server
- `npm run test` runs backend API tests
- `npm run verify:e2e` builds the app, starts the production server, and verifies the full flow

## API Contract

### `GET /milestones`

Returns all milestones sorted by milestone date and latest update time.

### `POST /milestones`

Accepts:

```json
{
  "title": "Finished my portfolio redesign",
  "category": "Work",
  "date": "2026-03-30"
}
```

Validation rules:

- `title` is required and must be at least 3 characters long
- `category` must be one of `Work`, `Personal`, or `Health`
- `date` must be a valid `YYYY-MM-DD` value

### `PUT /milestones/:id`

Updates an existing milestone with the same payload shape as `POST /milestones`.

### `DELETE /milestones/:id`

Deletes a milestone and returns the deleted id.

## Production Build

```bash
npm run build
npm run start
```

After building, the Express server serves the compiled frontend and the API from the same process.

## Railway Deploy

This repository is ready to deploy as a single Node web service on Railway.

Railway config is pinned in `railway.json`, including:

- `npm run build` as the build command
- `npm run start` as the start command
- `/health` as the healthcheck path

If you want to verify locally before deploying:

```bash
npm run verify:e2e
```

If you prefer to configure Railway manually in the dashboard, use:

```bash
Build Command: npm install && npm run build
Start Command: npm run start
```

No additional environment variables are required.

## Note

I kept persistence in-memory to match the assessment scope, but still structured the API as if it could be swapped to a database-backed store later without reshaping the frontend contract.
