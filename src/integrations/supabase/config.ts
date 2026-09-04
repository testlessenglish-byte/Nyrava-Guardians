/** Validate public configuration without ever including credential values in errors. */
export function publicSupabaseConfig(url?: string, key?: string) {
  if (!url || !key) {
    throw new Error(
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before building the app.",
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid Supabase URL.");
  }
  if (parsed.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
    throw new Error("Supabase must use HTTPS outside local development.");
  }
  if (key.startsWith("sb_secret_")) {
    throw new Error("A server secret cannot be used as the browser Supabase key.");
  }
  if (key.split(".").length === 3) {
    try {
      const payload = JSON.parse(atob(key.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")));
      if (payload.role !== "anon") throw new Error("not public");
    } catch {
      throw new Error("The browser requires an anon or publishable Supabase key.");
    }
  } else if (!key.startsWith("sb_publishable_")) {
    throw new Error("The browser requires an anon or publishable Supabase key.");
  }
  return { url, key };
}
