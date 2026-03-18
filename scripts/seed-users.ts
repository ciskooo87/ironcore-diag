import { Pool } from "pg";
import bcrypt from "bcryptjs";
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL não definido");
const pool = new Pool({ connectionString: databaseUrl, ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined });
const users = [
  ["admin@ironcore.diag", "Admin", "admin_master", process.env.SEED_ADMIN_PASS || "admin123"],
  ["head@ironcore.diag", "Head", "head", process.env.SEED_HEAD_PASS || "head123"],
  ["consultor@ironcore.diag", "Consultor", "consultor", process.env.SEED_CONS_PASS || "consultor123"]
];
for (const [email, name, role, pass] of users) {
  const hash = await bcrypt.hash(String(pass), 10);
  await pool.query(`insert into users(email,name,role,password_hash,active) values($1,$2,$3,$4,true)
    on conflict (email) do update set name=excluded.name, role=excluded.role, password_hash=excluded.password_hash, active=true`, [email, name, role, hash]);
}
await pool.end();
