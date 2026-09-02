import { describe, expect, it } from "vitest";
import { DEFAULT_SESSION_COOKIE_NAME, resolveSessionCookieName } from "./session-cookie";

describe("session cookie configuration", () => {
  it("uses the safe default when the configured cookie name is empty or whitespace", () => {
    expect(resolveSessionCookieName("")).toBe(DEFAULT_SESSION_COOKIE_NAME);
    expect(resolveSessionCookieName("   ")).toBe(DEFAULT_SESSION_COOKIE_NAME);
  });

  it("uses a trimmed configured cookie name", () => {
    expect(resolveSessionCookieName("  supportpilot_preview  ")).toBe("supportpilot_preview");
  });
});
