# Project Rules

## Technology
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Supabase for PostgreSQL/Auth/RLS and initially Storage
- GitHub for source control

## Architecture
- One Next.js application with role-based sections.
- PostgreSQL is the core data model.
- Avoid unnecessary microservices or separate frontend/backend projects.
- Keep storage access behind a service layer so the storage provider can be changed later.
- Use environment variables for secrets.

## Functional rules
- Never hard-code award categories into UI logic.
- Questions must come from database configuration.
- Upload rules must be configurable.
- Scoring criteria and weights must be configurable.
- Award editions must be configurable.
- Submitted nominations are read-only unless authorized admin reopens them.
- Jury members can access only assigned entries.
- Jury members cannot access other jurors' scores/comments.

## Development rules
- Build in small modules.
- Test after every module.
- Do not overwrite working code unnecessarily.
- Before changing database schema, explain the migration.
- Keep migrations version-controlled.
- Do not put secrets in Git.
