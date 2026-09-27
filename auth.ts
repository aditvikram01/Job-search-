import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isAllowed } from "@/lib/auth/allowlist";

/**
 * Login only. Gmail sending accounts are connected separately in Settings
 * (CLAUDE.md section 7), so login asks for basic scopes and nothing else.
 * Reads AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from env.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    signIn({ profile }) {
      // Refuse unverified Google emails and anyone not on the allowlist.
      return profile?.email_verified === true && isAllowed(profile.email);
    },
    authorized({ auth }) {
      // Used by proxy.ts: signed-out visitors are sent to /login.
      return Boolean(auth?.user);
    },
  },
});
