import "server-only";

export type AppMode = "local-full" | "public-demo";
export type RuntimeConfig = { mode: AppMode; publicDemo: boolean; provider: "ollama" | "mock"; baseUrl: string };

const configured = (env: Record<string, string | undefined>, name: string) => Boolean(env[name]?.trim());
const rejectConfigured = (env: Record<string, string | undefined>, names: string[], message: string) => {
  if (names.some((name) => configured(env, name))) throw new Error(message);
};

function readBaseUrl(env: Record<string, string | undefined>, publicDemo: boolean) {
  const value = env.APP_BASE_URL?.trim() || (publicDemo ? "" : "http://localhost:3000");
  if (!value) throw new Error("Public demo mode requires APP_BASE_URL");
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("APP_BASE_URL must be a valid absolute URL"); }
  if (url.pathname !== "/" || url.search || url.hash) throw new Error("APP_BASE_URL must not include a path, query, or fragment");
  if (publicDemo && url.protocol !== "https:") throw new Error("Public demo mode requires an HTTPS APP_BASE_URL");
  return url.origin;
}

export function validateRuntimeConfig(env: Record<string, string | undefined> = process.env): RuntimeConfig {
  const mode = (env.APP_MODE ?? "local-full") as AppMode;
  if (mode !== "local-full" && mode !== "public-demo") throw new Error("APP_MODE must be local-full or public-demo");
  const publicDemo = mode === "public-demo";
  const provider = (env.AI_PROVIDER ?? "ollama") as "ollama" | "mock";
  if (provider !== "ollama" && provider !== "mock") throw new Error("AI_PROVIDER is not approved");
  if (env.VERCEL_ENV === "production" && !publicDemo) throw new Error("Vercel production requires public-demo mode");
  if (publicDemo) {
    if (!configured(env, "DATABASE_URL")) throw new Error("Public demo mode requires DATABASE_URL");
    if (provider !== "mock" || env.ALLOW_MOCK_AI !== "true") throw new Error("Public demo mode requires the deterministic mock AI provider");
    rejectConfigured(env, ["OLLAMA_BASE_URL", "OLLAMA_CHAT_MODEL", "OLLAMA_EMBEDDING_MODEL", "OLLAMA_EMBEDDING_DIMENSIONS"], "Public demo mode cannot configure Ollama");
    rejectConfigured(env, ["LOCAL_STORAGE_ROOT", "PRIVATE_UPLOADS_ENABLED", "UPLOAD_STORAGE_PROVIDER", "BLOB_READ_WRITE_TOKEN", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"], "Public demo mode cannot configure private uploads or storage");
    rejectConfigured(env, ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "PAYMENT_PROVIDER"], "Public demo mode cannot configure real payments");
    rejectConfigured(env, ["SMTP_URL", "SMTP_HOST", "SMTP_PASSWORD", "RESEND_API_KEY", "SENDGRID_API_KEY", "POSTMARK_SERVER_TOKEN"], "Public demo mode cannot configure external email delivery");
    if (configured(env, "EMAIL_PROVIDER") && env.EMAIL_PROVIDER !== "development-outbox") throw new Error("Public demo mode only permits the development email outbox");
  }
  if (!publicDemo && env.OLLAMA_BASE_URL && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(env.OLLAMA_BASE_URL)) throw new Error("Ollama must remain bound to localhost");
  return { mode, publicDemo, provider, baseUrl: readBaseUrl(env, publicDemo) };
}
