import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error(
      "Turso database configuration is unavailable. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before using the database."
    );
  }

  database ??= drizzle(createClient({ url, authToken }), { schema });
  return database;
}
