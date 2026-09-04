const IMMERSIVE_GAME_PREFIXES = ["/realm", "/isla", "/classroom", "/missions", "/city", "/home-hq", "/world/"] as const;

export function isImmersiveGameRoute(pathname: string) {
  if (pathname === "/world" || pathname === "/world/") return false;
  return IMMERSIVE_GAME_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}`),
  );
}

export function immersiveGameRoutes() {
  return [...IMMERSIVE_GAME_PREFIXES];
}
