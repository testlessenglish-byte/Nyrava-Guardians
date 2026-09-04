import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema.ts";

export function getDb() {
  interface Env {
    DB: D1Database;
  }
  const env = (
    typeof globalThis !== "undefined"
      ? (globalThis as unknown as { __cf_env?: Env }).__cf_env ||
        (process as unknown as { env?: Env })?.env
      : null
  ) as Env | null;
  if (!env || !env.DB) {
    throw new Error("Secure admin storage is not connected yet.");
  }
  return drizzle(env.DB, { schema });
}
