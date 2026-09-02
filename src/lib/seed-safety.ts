export const PORTFOLIO_SEED_CONFIRMATION = "SEED_NON_PRIVATE_PORTFOLIO_DATA";

export function assertSeedSafety(env: Record<string, string | undefined> = process.env) {
  const production = env.NODE_ENV === "production" || env.VERCEL_ENV === "production";
  if (!production) return;
  if (env.APP_MODE !== "public-demo" && env.APP_MODE !== "public-beta") throw new Error("Production seeding is only allowed in public-demo or public-beta mode");
  if (env.SEED_CONFIRMATION !== PORTFOLIO_SEED_CONFIRMATION) throw new Error("Production seeding requires explicit non-private portfolio-data confirmation");
}
