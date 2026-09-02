import { describe, expect, it } from "vitest";
import { assertSeedSafety, PORTFOLIO_SEED_CONFIRMATION } from "./seed-safety";

describe("portfolio seed guard", () => {
  it("allows local development seeding", () => expect(() => assertSeedSafety({ APP_MODE: "local-full" })).not.toThrow());
  it("requires a hosted public mode and explicit confirmation in production", () => {
    expect(() => assertSeedSafety({ NODE_ENV: "production", APP_MODE: "local-full" })).toThrow(/public-demo/);
    expect(() => assertSeedSafety({ NODE_ENV: "production", APP_MODE: "public-demo" })).toThrow(/confirmation/);
    expect(() => assertSeedSafety({ NODE_ENV: "production", APP_MODE: "public-demo", SEED_CONFIRMATION: PORTFOLIO_SEED_CONFIRMATION })).not.toThrow();
    expect(() => assertSeedSafety({ NODE_ENV: "production", APP_MODE: "public-beta", SEED_CONFIRMATION: PORTFOLIO_SEED_CONFIRMATION })).not.toThrow();
  });
});
