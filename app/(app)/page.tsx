import Link from "next/link";
import { auth } from "@/auth";

const COUNTERS = [
  { label: "Drafts to review", href: "/review" },
  { label: "LinkedIn steps", href: "/linkedin" },
  { label: "New opportunities", href: "/opportunities" },
];

export default async function TodayPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {firstName ? `Hi ${firstName}` : "Today"}
        </h1>
        <p className="mt-1 text-muted">Here&apos;s what needs you today.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {COUNTERS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border border-border bg-surface p-5 hover:border-accent"
          >
            <span className="block text-3xl font-semibold">0</span>
            <span className="text-sm text-muted">{c.label}</span>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-medium">Getting set up</h2>
        <p className="mt-1 text-sm text-muted">
          The app is being built in phases. Login works now. Next up: your
          list of people and the Excel import.
        </p>
        <Link href="/settings" className="mt-3 inline-block text-sm font-medium text-accent">
          Check system status →
        </Link>
      </div>
    </section>
  );
}
