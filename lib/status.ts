import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";

export type DbStatus =
  | { ok: true; migrated: boolean }
  | { ok: false; reason: string };

/** Can we reach Postgres, and has the first migration run? */
export async function dbStatus(): Promise<DbStatus> {
  if (!process.env.DATABASE_URL) {
    return { ok: false, reason: "DATABASE_URL is not set" };
  }
  try {
    const result = await getDb().execute(
      sql`select to_regclass('public.people') is not null as migrated`,
    );
    const row = result.rows[0] as { migrated?: boolean } | undefined;
    return { ok: true, migrated: Boolean(row?.migrated) };
  } catch {
    // Don't leak connection details to the page.
    return { ok: false, reason: "Could not connect to the database" };
  }
}
