import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";
import { sites } from "@openai/sites-vite-plugin";

// No editor/devtools instrumentation is injected into the Three.js scene.
export default defineConfig(({ command, mode }) => {
  // Do not use TSS_PRERENDERING to decide that a production Sites build is a
  // mobile SPA. TanStack Start sets it during its own build lifecycle, and that
  // previously caused the config to switch output modes mid-build.
  const mobile = mode === "mobile" || process.env["npm_lifecycle_event"] === "build:mobile";
  const vercel = process.env["VERCEL"] === "1";

  return {
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
      tanstackStart({
        server: { entry: "server" },
        spa: { enabled: mobile, prerender: { outputPath: "/index.html" } },
      }),
      ...(command === "build" && !mobile
        ? [
            vercel
              ? nitro()
              : nitro({
                  preset: "cloudflare-module",
                  output: { dir: "dist", serverDir: "dist/server", publicDir: "dist/client" },
                  rollupConfig: { output: { entryFileNames: "index.js" } },
                  cloudflare: { nodeCompat: true },
                  routeRules: {
                    "/**": {
                      headers: {
                        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
                      },
                    },
                  },
                }),
          ]
        : []),
      react(),
      ...(!mobile && !vercel ? [sites()] : []),
    ],
    build: {
      rolldownOptions: { external: ["cloudflare:workers"] },
      ...(mobile ? { outDir: ".mobile-build" } : {}),
    },
    ...(mobile
      ? {
          environments: { client: { build: { outDir: "dist-mobile" } } },
        }
      : {}),
    server: { host: "127.0.0.1", port: 8080, strictPort: true },
    resolve: {
      alias: {
        ...(mobile ? { "cloudflare:workers": "data:text/javascript,export const env = {};" } : {}),
      },
      dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
