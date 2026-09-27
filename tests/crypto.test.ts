import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "@/lib/crypto";

const KEY = randomBytes(32).toString("base64");

describe("token encryption", () => {
  it("round-trips", () => {
    const token = "1//refresh-token-example";
    const sealed = encryptSecret(token, KEY);
    expect(sealed).not.toContain(token);
    expect(decryptSecret(sealed, KEY)).toBe(token);
  });

  it("uses a fresh IV each time", () => {
    expect(encryptSecret("same", KEY)).not.toBe(encryptSecret("same", KEY));
  });

  it("rejects a tampered payload", () => {
    const parts = encryptSecret("secret", KEY).split(".");
    parts[3] = Buffer.from("tampered").toString("base64url");
    expect(() => decryptSecret(parts.join("."), KEY)).toThrow();
  });

  it("rejects the wrong key", () => {
    const sealed = encryptSecret("secret", KEY);
    const other = randomBytes(32).toString("base64");
    expect(() => decryptSecret(sealed, other)).toThrow();
  });

  it("requires a 32-byte key", () => {
    expect(() => encryptSecret("x", undefined)).toThrow(/not set/);
    expect(() => encryptSecret("x", Buffer.from("short").toString("base64"))).toThrow(/32 bytes/);
  });
});
