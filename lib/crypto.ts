import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * AES-256-GCM for Gmail refresh tokens at rest (CLAUDE.md section 7).
 * Output format: v1.<iv>.<tag>.<ciphertext>, each part base64url.
 */
const VERSION = "v1";

function loadKey(keyB64: string | undefined): Buffer {
  if (!keyB64) throw new Error("TOKEN_ENCRYPTION_KEY is not set");
  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes, base64 encoded");
  }
  return key;
}

export function encryptSecret(
  plaintext: string,
  keyB64: string | undefined = process.env.TOKEN_ENCRYPTION_KEY,
): string {
  const key = loadKey(keyB64);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv, tag, ciphertext]
    .map((p) => (typeof p === "string" ? p : p.toString("base64url")))
    .join(".");
}

export function decryptSecret(
  payload: string,
  keyB64: string | undefined = process.env.TOKEN_ENCRYPTION_KEY,
): string {
  const key = loadKey(keyB64);
  const [version, iv, tag, ciphertext] = payload.split(".");
  if (version !== VERSION || !iv || !tag || !ciphertext) {
    throw new Error("Unrecognised encrypted payload");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
