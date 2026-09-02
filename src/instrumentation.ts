export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateRuntimeConfig } = await import("./lib/runtime-config");
    validateRuntimeConfig();
  }
}
