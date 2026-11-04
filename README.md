<p align="center"><img src="public/icon-192.png" alt="Z Note" width="96" height="96"></p>

# Z Note

A minimal Markdown notebook. Graphite and white, nothing else.

## Features

- Create, edit, delete and search notes
- Markdown editor with live preview and split view
- Automatic saving with a save status indicator
- Pin important notes; the rest are sorted by most recently updated
- Responsive layout with light and dark themes
- Simple sidebar with the notes list and search

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOWNER%2Fz-note&project-name=z-note&repository-name=z-note&stores=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22neon%22%2C%22productSlug%22%3A%22neon%22%2C%22protocol%22%3A%22storage%22%7D%5D)

The button clones the repo, creates a Neon Postgres database and sets `DATABASE_URL` for you. There's nothing else to configure: the database table is created on the first request.

> Forking this repo? Replace `OWNER` in the button link above with your GitHub user or organization.

There's no authentication in v1. Anyone with the URL can read and edit notes, so keep the deployment URL private or put it behind [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection).

## Local development

Requires Node.js 20.9 or later.

```bash
cp .env.example .env.local   # then paste a Neon connection string into DATABASE_URL
npm install
npm run dev
```

## Scripts

| Command         | What it does                                         |
| --------------- | ---------------------------------------------------- |
| `npm run dev`   | Start the dev server at http://localhost:3000        |
| `npm run build` | Production build (needs no database)                 |
| `npm test`      | Unit tests; database tests run in-memory with PGlite |

## Database

One table, `notes`, created automatically with `CREATE TABLE IF NOT EXISTS` the first time the app queries the database. There are no migrations to run. See [lib/schema.ts](lib/schema.ts).

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Neon Postgres (`@neondatabase/serverless`) · react-markdown · Vitest
