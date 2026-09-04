// Keep sessions on this origin; do not forward them to an editor or parent frame.
// The export name is retained for compatibility with the generated client.
export function brokeredPreviewStorage() {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    // Supabase falls back to memory when browser storage is unavailable.
    return undefined;
  }
}
