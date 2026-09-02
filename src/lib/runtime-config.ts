import "server-only";

export type AppMode = "local-full" | "public-demo" | "public-beta";
export type RuntimeConfig = { mode: AppMode; publicDemo: boolean; publicBeta: boolean; hostedPublic: boolean; provider: "ollama" | "mock"; baseUrl: string };

const configured = (env: Record<string, string | undefined>, name: string) => Boolean(env[name]?.trim());
const rejectConfigured = (env: Record<string, string | undefined>, names: string[], message: string) => {
  if (names.some((name) => configured(env, name))) throw new Error(message);
};

function readBaseUrl(env: Record<string, string | undefined>, hostedPublic: boolean) {
  const value = env.APP_BASE_URL?.trim() || (hostedPublic ? "" : "http://localhost:3000");
  if (!value) throw new Error("Public hosted modes require APP_BASE_URL");
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("APP_BASE_URL must be a valid absolute URL"); }
  if (url.pathname !== "/" || url.search || url.hash) throw new Error("APP_BASE_URL must not include a path, query, or fragment");
  if (hostedPublic && url.protocol !== "https:") throw new Error("Public hosted modes require an HTTPS APP_BASE_URL");
  return url.origin;
}

export function validateRuntimeConfig(env: Record<string, string | undefined> = process.env): RuntimeConfig {
  const mode = (env.APP_MODE ?? "local-full") as AppMode;
  if (mode !== "local-full" && mode !== "public-demo" && mode !== "public-beta") throw new Error("APP_MODE must be local-full, public-demo, or public-beta");
  const publicDemo = mode === "public-demo";
  const publicBeta = mode === "public-beta";
  const hostedPublic = publicDemo || publicBeta;
  const provider = (env.AI_PROVIDER ?? "ollama") as "ollama" | "mock";
  if (provider !== "ollama" && provider !== "mock") throw new Error("AI_PROVIDER is not approved");
  if (env.VERCEL_ENV === "production" && !hostedPublic) throw new Error("Vercel production requires public-demo or public-beta mode");
  if (hostedPublic) {
    if (!configured(env, "DATABASE_URL")) throw new Error("Public hosted modes require DATABASE_URL");
    if (provider !== "mock" || env.ALLOW_MOCK_AI !== "true") throw new Error("Public hosted modes require the deterministic mock AI provider");
    rejectConfigured(env, ["OLLAMA_BASE_URL", "OLLAMA_CHAT_MODEL", "OLLAMA_EMBEDDING_MODEL", "OLLAMA_EMBEDDING_DIMENSIONS"], "Public hosted modes cannot configure Ollama");
    rejectConfigured(env, ["LOCAL_STORAGE_ROOT", "PRIVATE_UPLOADS_ENABLED", "UPLOAD_STORAGE_PROVIDER", "BLOB_READ_WRITE_TOKEN", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"], "Public hosted modes cannot configure private uploads or storage");
    rejectConfigured(env, ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "PAYMENT_PROVIDER"], "Public hosted modes cannot configure real payments");
    rejectConfigured(env, ["SMTP_URL", "SMTP_HOST", "SMTP_PASSWORD", "RESEND_API_KEY", "SENDGRID_API_KEY", "POSTMARK_SERVER_TOKEN"], "Public hosted modes cannot configure external email delivery");
    if (configured(env, "EMAIL_PROVIDER") && env.EMAIL_PROVIDER !== "development-outbox") throw new Error("Public hosted modes only permit the development email outbox");
  }
  if (!publicDemo && env.OLLAMA_BASE_URL && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(env.OLLAMA_BASE_URL)) throw new Error("Ollama must remain bound to localhost");
  return { mode, publicDemo, publicBeta, hostedPublic, provider, baseUrl: readBaseUrl(env, hostedPublic) };
}
