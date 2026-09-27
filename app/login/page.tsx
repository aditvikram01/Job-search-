import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { isAllowed } from "@/lib/auth/allowlist";

const MESSAGES: Record<string, string> = {
  AccessDenied:
    "This app is private. That Google account isn't on the list. Try the account you were invited with.",
  Configuration:
    "Login isn't set up yet. Check the Google and AUTH_ settings in Vercel.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const session = await auth();
  // Only allowed users skip the login page; anyone else would loop.
  if (session?.user && isAllowed(session.user.email)) redirect("/");

  const { error } = await searchParams;
  const message =
    typeof error === "string"
      ? (MESSAGES[error] ?? "Something went wrong signing in. Please try again.")
      : null;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Outreach Desk</h1>
        <p className="mt-2 text-sm text-muted">
          Find the right people, write to them, and follow up without losing
          track.
        </p>

        {message && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            {message}
          </p>
        )}

        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white hover:opacity-90"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}
