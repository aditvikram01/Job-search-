/**
 * Which environment variables are configured, for the Settings status panel.
 * Returns booleans only: never send secret values to the browser.
 */
export const REQUIRED_ENV = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "ALLOWED_EMAILS",
  "TOKEN_ENCRYPTION_KEY",
] as const;

// Needed from later phases on; shown so setup can be done in one pass.
export const LATER_ENV = [
  "OPENAI_API_KEY",
  "SEARCH_API_KEY",
  "INNGEST_EVENT_KEY",
  "INNGEST_SIGNING_KEY",
  "BLOB_READ_WRITE_TOKEN",
] as const;

export function envStatus(env: NodeJS.ProcessEnv = process.env) {
  const check = (names: readonly string[]) =>
    names.map((name) => ({ name, set: Boolean(env[name]?.trim()) }));
  return { required: check(REQUIRED_ENV), later: check(LATER_ENV) };
}
