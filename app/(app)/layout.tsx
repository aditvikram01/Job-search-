import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { isAllowed } from "@/lib/auth/allowlist";
import { NavLinks } from "@/components/nav-links";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  // Real authorization check; proxy.ts is only an optimistic redirect.
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAllowed(session.user.email)) redirect("/login?error=AccessDenied");

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <span className="font-semibold">Outreach Desk</span>
          <nav className="hidden flex-1 gap-1 md:flex">
            <NavLinks variant="top" />
          </nav>
          <form
            className="ml-auto md:ml-0"
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="text-sm text-muted hover:text-foreground">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 flex border-t border-border bg-surface md:hidden">
        <NavLinks variant="bottom" />
      </nav>
    </div>
  );
}
