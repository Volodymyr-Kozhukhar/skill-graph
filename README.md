# Skill Graph

A project in development for mapping skills, their relationships, and learning progress.

## Current functionality

The initial backend uses Node.js HTTP and TypeScript:

- `GET /` returns `200` with a plain-text server status.
- `GET /health` returns `200` with `{"status":"ok"}`.
- Other requests return `404` with `{"error":"Not found"}`.
- The `PORT` environment variable sets the port; the default is `3000`.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000/health`. Stop the server with Ctrl+C.

```sh
npm run typecheck
```

## Next steps

- Skill CRUD API with Express and runtime input validation.
- PostgreSQL persistence.
- React interface for skills, relationships, and progress.
- Authentication and automated tests.

These features are planned and are not implemented yet.
