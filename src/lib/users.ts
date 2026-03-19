import { dbQuery } from "@/lib/db";
import type { UserRole } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export type DbUser = {
  id: string;
  email: string;
  role: UserRole;
  name: string;
};

export async function getUserByEmail(email: string) {
  try {
    const q = await dbQuery<DbUser>("select id, email, role, name from users where email = $1 and active = true", [email.toLowerCase()]);
    return q.rows[0] || null;
  } catch {
    return null;
  }
}

export async function resetUserPassword(email: string, newPassword: string) {
  const hash = await hashPassword(newPassword);
  await dbQuery("update users set password_hash=$2 where email=$1", [email.toLowerCase(), hash]);
}

export async function listUsers() {
  const q = await dbQuery<DbUser>("select id, email, role, name from users where active=true order by email");
  return q.rows;
}

export async function createUser(input: { email: string; name: string; role: UserRole; password: string }) {
  const hash = await hashPassword(input.password);
  await dbQuery(
    `insert into users(email,name,role,password_hash,active)
     values($1,$2,$3,$4,true)
     on conflict (email) do update set name=excluded.name, role=excluded.role, password_hash=excluded.password_hash, active=true`,
    [input.email.toLowerCase(), input.name, input.role, hash]
  );
}

