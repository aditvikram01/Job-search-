import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let db: ReturnType<typeof createDb> | undefined;

function createDb(url: string) {
  return drizzle(neon(url), { schema });
}

/** Lazily connects so builds and pages work before DATABASE_URL is set. */
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  db ??= createDb(url);
  return db;
}

export { schema };
