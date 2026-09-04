import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.nyrava.guardians",
  appName: "Nyrava Guardians",
  webDir: "dist-mobile",
  backgroundColor: "#080f20",
  server: { androidScheme: "https", hostname: "localhost", cleartext: false },
  android: { allowMixedContent: false, webContentsDebuggingEnabled: false },
  ios: { contentInset: "never", scrollEnabled: false, webContentsDebuggingEnabled: false },
};

export default config;
