import { createClient } from "@libsql/client";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) throw new Error("TURSO_DATABASE_URL과 TURSO_AUTH_TOKEN이 필요합니다.");

const client = createClient({ url, authToken });
await client.execute(`CREATE TABLE IF NOT EXISTS app_migrations (
  name TEXT PRIMARY KEY NOT NULL,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

const directory = resolve("drizzle");
const files = (await readdir(directory)).filter((name) => /^\d{4}_.+\.sql$/.test(name)).sort();
for (const name of files) {
  const applied = await client.execute({ sql: "SELECT name FROM app_migrations WHERE name = ?", args: [name] });
  if (applied.rows.length) continue;

  const source = await readFile(resolve(directory, name), "utf8");
  const statements = source
    .split(/--> statement-breakpoint|;\s*(?:\r?\n|$)/g)
    .map((statement) => statement.trim())
    .filter(Boolean);
  await client.batch([
    ...statements.map((sql) => ({ sql, args: [] })),
    { sql: "INSERT INTO app_migrations (name) VALUES (?)", args: [name] },
  ], "write");
  console.log(`applied ${name}`);
}

console.log(`database is current (${files.length} migrations)`);
client.close();
