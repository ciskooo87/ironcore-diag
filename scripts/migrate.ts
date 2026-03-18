import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL não definido");

const pool = new Pool({ connectionString: databaseUrl, ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined });
const dir = path.join(process.cwd(), "db", "migrations");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
for (const file of files) {
  const sql = fs.readFileSync(path.join(dir, file), "utf8");
  console.log(`[migrate] ${file}`);
  await pool.query(sql);
}
await pool.end();
