// Optimistic check only: pages re-check the session and allowlist
// server-side in app/(app)/layout.tsx.
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
};
