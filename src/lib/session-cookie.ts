export const DEFAULT_SESSION_COOKIE_NAME = "supportpilot_session";

export function resolveSessionCookieName(value = process.env.SESSION_COOKIE_NAME) {
  return value?.trim() || DEFAULT_SESSION_COOKIE_NAME;
}
