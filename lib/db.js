// Camada de banco de dados.
// - Em produção (Vercel): usa Postgres serverless da Neon via DATABASE_URL.
// - Em desenvolvimento sem DATABASE_URL: usa PGlite (Postgres embutido) gravando em ./.data
import "server-only";

let clientPromise;
let schemaPromise;

async function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
      if (url) {
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(url);
        return { query: (text, params = []) => sql.query(text, params) };
      }
      if (process.env.VERCEL) {
        throw new Error(
          "DATABASE_URL não configurada. Conecte um banco Neon ao projeto na Vercel (Storage → Neon)."
        );
      }
      const { mkdirSync } = await import("node:fs");
      mkdirSync("./.data", { recursive: true });
      const { PGlite } = await import("@electric-sql/pglite");
      const db = new PGlite("./.data/pglite");
      return {
        query: async (text, params = []) => (await db.query(text, params)).rows,
      };
    })();
  }
  return clientPromise;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'Membro',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS sprints (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    goal TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'planned',
    start_date DATE,
    end_date DATE,
    committed_points INT,
    completed_points INT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT 'story',
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    points INT,
    assignee_id INT REFERENCES users(id) ON DELETE SET NULL,
    reporter_id INT REFERENCES users(id) ON DELETE SET NULL,
    sprint_id INT REFERENCES sprints(id) ON DELETE SET NULL,
    position DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    issue_id INT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    author_id INT REFERENCES users(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS activity (
    id SERIAL PRIMARY KEY,
    issue_id INT REFERENCES issues(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS issues_sprint_idx ON issues(sprint_id)`,
  `CREATE INDEX IF NOT EXISTS comments_issue_idx ON comments(issue_id)`,
];

async function ensureSchema(client) {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      for (const stmt of SCHEMA) await client.query(stmt);
    })().catch((e) => {
      schemaPromise = undefined;
      throw e;
    });
  }
  return schemaPromise;
}

/** Executa SQL parametrizado ($1, $2...) e retorna as linhas. */
export async function q(text, params = []) {
  const client = await getClient();
  await ensureSchema(client);
  return client.query(text, params);
}

export async function one(text, params = []) {
  const rows = await q(text, params);
  return rows[0] ?? null;
}
