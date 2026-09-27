import { connection } from "next/server";
import { auth } from "@/auth";
import { envStatus } from "@/lib/env";
import { dbStatus } from "@/lib/status";

function Dot({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${ok ? "bg-green-500" : "bg-stone-400"}`}
    />
  );
}

function Row({ ok, label, hint }: { ok: boolean; label: string; hint?: string }) {
  return (
    <li className="flex items-start gap-3 py-2">
      <span className="mt-1.5">
        <Dot ok={ok} />
      </span>
      <span>
        <span className="block">{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
    </li>
  );
}

export default async function SettingsPage() {
  await connection(); // read env at request time, not build time
  const session = await auth();
  const env = envStatus();
  const db = await dbStatus();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-medium">Signed in</h2>
        <p className="mt-1 text-muted">{session?.user?.email}</p>
        <p className="mt-3 text-sm text-muted">
          Sending accounts (add or remove any Gmail), your CV, your
          experience list, follow-up timing and send time will live here from
          phase 3.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-medium">System check</h2>
        <ul className="mt-2 divide-y divide-border">
          <Row
            ok={db.ok}
            label={db.ok ? "Database connected" : "Database not connected"}
            hint={db.ok ? undefined : db.reason}
          />
          {db.ok && (
            <Row
              ok={db.migrated}
              label={db.migrated ? "Database tables created" : "Database tables missing"}
              hint={db.migrated ? undefined : "Run npm run db:migrate (see README)."}
            />
          )}
          {env.required.map((v) => (
            <Row key={v.name} ok={v.set} label={v.name} hint={v.set ? undefined : "Not set"} />
          ))}
        </ul>

        <h3 className="mt-5 text-sm font-medium text-muted">
          Needed in later phases
        </h3>
        <ul className="mt-1 divide-y divide-border">
          {env.later.map((v) => (
            <Row key={v.name} ok={v.set} label={v.name} hint={v.set ? undefined : "Not set yet (fine for now)"} />
          ))}
        </ul>
      </div>
    </section>
  );
}
