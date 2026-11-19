import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";
import { one } from "./db";

const COOKIE = "agil_session";
const secret = () => process.env.SESSION_SECRET || "dev-secret-troque-em-producao";

function sign(value) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export async function createSession(userId) {
  const value = String(userId);
  const store = await cookies();
  store.set(COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getCurrentUser() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [value, sig] = raw.split(".");
  if (!value || !sig) return null;
  const expected = sign(value);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return one("SELECT id, name, email, role FROM users WHERE id = $1", [Number(value)]);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
