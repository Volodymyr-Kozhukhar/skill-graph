# Skill Graph

A project in development for mapping skills, their relationships, and learning progress.

## Current functionality

The backend uses Node.js, Express, TypeScript, and PostgreSQL. Skills are stored in PostgreSQL and survive server restarts. This is currently an unauthenticated API with one shared skill list; accounts, skill relationships, and the frontend are not implemented yet.

- `GET /` returns `200` with a plain-text server status.
- `GET /health` returns `200` with `{"status":"ok"}`.
- `GET /ready` verifies the PostgreSQL connection and returns `200` with `{"status":"ready"}`.
- `GET /skills` lists skills.
- `GET /skills/:id` returns one skill.
- `GET /skills/:id/score` derives a numeric score from the current proficiency level.
- `POST /skills` creates a skill with a title and proficiency level.
- `PATCH /skills/:id` updates the title, proficiency level, or both.
- `DELETE /skills/:id` deletes a skill.
- Runtime validation rejects invalid request bodies and route IDs.
- API errors use a consistent JSON structure with a machine-readable code and a safe message.
- Malformed JSON is handled without exposing an HTML error page or stack trace.
- Other requests return a JSON `404 NOT_FOUND` error.
- The `SERVER_PORT` environment variable sets the port; the default is `4000`.

Supported proficiency levels are `beginner`, `intermediate`, and `advanced`.

Example request body:

```json
{
  "title": "TypeScript",
  "proficiency": "intermediate"
}
```

## Run locally

Use Node.js 24, npm, and Docker Desktop. On a fresh clone, copy the example configuration if `.env` does not exist, then set your own database password in `.env`:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm ci
docker compose up -d
```

Apply the initial migration once, before starting the API. The command below uses the example database user and name; if you changed them in `.env`, update `-U` and `-d` accordingly:

```powershell
Get-Content -Raw migrations/001_create_skills.sql | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U skill_graph_app -d skill_graph
```

In Command Prompt, use input redirection instead:

```cmd
docker compose exec -T db psql -v ON_ERROR_STOP=1 -U skill_graph_app -d skill_graph < migrations\001_create_skills.sql
```

The expected output is `CREATE TABLE`. Do not rerun this migration on an existing database: the table already exists. Docker keeps database data in a named volume, so restarting the container does not require another migration. Start the API:

```powershell
npm run dev
```

Open `http://localhost:4000/health` to check the server and `http://localhost:4000/ready` to check the database connection. `GET /skills` confirms that the table is available. Stop the server with Ctrl+C.

```powershell
npm run typecheck
```

The API reads `.env` at startup. Keep this file private; only `.env.example` belongs in Git. Schema changes are currently applied manually. A migration runner is planned before deployment.
The development database port is bound to `127.0.0.1`, so it is not published on other host interfaces.

## Next steps

- Automated API tests.
- Relationships between skills and progress scoring.
- Automated migration tracking for future schema changes.
- React interface for skills, relationships, and progress.
- Authentication and deployment.

These features are planned and are not implemented yet.
