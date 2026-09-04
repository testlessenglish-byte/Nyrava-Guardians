/** Continuous synthetic ambience always requires a fresh, explicit opt-in. */
export function quietStartup<T extends { backgroundMusic: boolean }>(settings: T): T {
  return { ...settings, backgroundMusic: false };
}
