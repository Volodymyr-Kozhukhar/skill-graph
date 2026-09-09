# Skill Graph

A project in development for mapping skills, their relationships, and learning progress.

## Current functionality

The backend uses Node.js, Express, and TypeScript. Skills are currently stored in memory.

- `GET /` returns `200` with a plain-text server status.
- `GET /health` returns `200` with `{"status":"ok"}`.
- `GET /skills` lists skills.
- `GET /skills/:id` returns one skill.
- `POST /skills` creates a skill with a title and proficiency level.
- `PATCH /skills/:id` updates the title, proficiency level, or both.
- `DELETE /skills/:id` deletes a skill.
- Runtime validation rejects invalid request bodies and route IDs.
- Other requests return `404` with `{"error":"Not found"}`.
- The `PORT` environment variable sets the port; the default is `4000`.

Supported proficiency levels are `beginner`, `intermediate`, and `advanced`.

Example request body:

```json
{
  "title": "TypeScript",
  "proficiency": "intermediate"
}
```

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:4000/health`. Stop the server with Ctrl+C.

```sh
npm run typecheck
```

## Next steps

- Consistent API errors and automated API tests.
- Relationships between skills and progress scoring.
- PostgreSQL persistence.
- React interface for skills, relationships, and progress.
- Authentication and deployment.

These features are planned and are not implemented yet.
