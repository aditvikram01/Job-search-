import { describe, expect, it } from "vitest";
import { isAllowed, parseAllowlist } from "@/lib/auth/allowlist";

const RAW = " Aditya@Example.com , rasleen@example.com,, ";

describe("allowlist", () => {
  it("parses, trims and lowercases", () => {
    expect([...parseAllowlist(RAW)]).toEqual([
      "aditya@example.com",
      "rasleen@example.com",
    ]);
  });

  it("allows listed emails case-insensitively", () => {
    expect(isAllowed("ADITYA@example.com", RAW)).toBe(true);
    expect(isAllowed("rasleen@example.com ", RAW)).toBe(true);
  });

  it("refuses everyone else", () => {
    expect(isAllowed("someone@example.com", RAW)).toBe(false);
    expect(isAllowed("", RAW)).toBe(false);
    expect(isAllowed(null, RAW)).toBe(false);
    expect(isAllowed(undefined, RAW)).toBe(false);
  });

  it("refuses everyone when the allowlist is empty or unset", () => {
    expect(isAllowed("aditya@example.com", "")).toBe(false);
    expect(isAllowed("aditya@example.com", undefined)).toBe(false);
  });
});
