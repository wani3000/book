import { createClient } from "@libsql/client";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const backupPath = process.argv[2];
if (!url || !authToken) throw new Error("TURSO_DATABASE_URL과 TURSO_AUTH_TOKEN이 필요합니다.");
if (!backupPath) throw new Error("사용법: npm run db:import -- /absolute/path/to/production-backup.json");
if (process.env.ALLOW_DB_IMPORT !== "true") throw new Error("운영 데이터 가져오기는 ALLOW_DB_IMPORT=true일 때만 실행됩니다.");

const payload = JSON.parse(await readFile(resolve(backupPath), "utf8"));
if (!payload?.tables || typeof payload.tables !== "object") throw new Error("지원하지 않는 백업 형식입니다.");

const client = createClient({ url, authToken });
const tableOrder = [
  "members", "auth_identities", "orders", "payment_attempts", "refund_requests",
  "reviews", "audit_logs", "request_limits", "notification_outbox",
];
const existing = await client.execute("SELECT COUNT(*) AS count FROM members");
if (Number(existing.rows[0]?.count ?? 0) > 0) throw new Error("대상 데이터베이스에 회원 데이터가 있어 가져오기를 중단했습니다.");

for (const table of tableOrder) {
  if (!/^[a-z_]+$/.test(table)) throw new Error("잘못된 테이블 이름입니다.");
  const rows = Array.isArray(payload.tables[table]) ? payload.tables[table] : [];
  if (!rows.length) {
    console.log(`${table}: 0 rows`);
    continue;
  }
  const columnsResult = await client.execute(`PRAGMA table_info(${table})`);
  const allowed = new Set(columnsResult.rows.map((row) => String(row.name)));
  const statements = rows.map((row) => {
    const columns = Object.keys(row).filter((column) => allowed.has(column));
    if (!columns.length) throw new Error(`${table}에 가져올 수 있는 열이 없습니다.`);
    return {
      sql: `INSERT INTO ${table} (${columns.map((column) => `\`${column}\``).join(",")}) VALUES (${columns.map(() => "?").join(",")})`,
      args: columns.map((column) => row[column]),
    };
  });
  await client.batch(statements, "write");
  console.log(`${table}: ${statements.length} rows`);
}

client.close();
console.log("D1 backup import completed");
