import { eq } from "drizzle-orm";
import { apiProviderSecrets, apiSecretAudit } from "../../../db/schema.ts";
import { getDb } from "../../../db/index.ts";
import { decryptSecret, encryptSecret, lastFour } from "./key-crypto.ts";

export const API_PROVIDERS = ["gemini", "groq"] as const;
export type ApiProvider = (typeof API_PROVIDERS)[number];

type StoredSecret = typeof apiProviderSecrets.$inferSelect;

const PROVIDER_ENV: Record<ApiProvider, string> = {
  gemini: "GEMINI_API_KEY",
  groq: "GROQ_API_KEY",
};

const PROVIDER_LABEL: Record<ApiProvider, string> = {
  gemini: "Gemini",
  groq: "Groq",
};

function encryptionKey() {
  const key = process.env["API_KEY_ENCRYPTION_KEY"];
  if (!key) throw new Error("Secure key storage is not configured yet.");
  return key;
}

function cleanApiKey(value: string) {
  const key = value.trim();
  if (key.length < 20 || key.length > 500 || /\s/.test(key)) {
    throw new Error("Enter a complete API key without spaces.");
  }
  return key;
}

async function findStoredSecret(provider: ApiProvider): Promise<StoredSecret | null> {
  const rows = await getDb()
    .select()
    .from(apiProviderSecrets)
    .where(eq(apiProviderSecrets.provider, provider))
    .limit(1);
  return rows[0] ?? null;
}

async function audit(
  provider: ApiProvider,
  action: "created" | "rotated" | "removed",
  actor: string,
) {
  await getDb().insert(apiSecretAudit).values({
    id: crypto.randomUUID(),
    provider,
    action,
    actor,
    createdAt: new Date().toISOString(),
  });
}

export async function validateProviderApiKey(provider: ApiProvider, rawKey: string) {
  const key = cleanApiKey(rawKey);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response =
      provider === "gemini"
        ? await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", {
            headers: { "x-goog-api-key": key },
            signal: controller.signal,
          })
        : await fetch("https://api.groq.com/openai/v1/models", {
            headers: { Authorization: `Bearer ${key}` },
            signal: controller.signal,
          });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`${PROVIDER_LABEL[provider]} rejected this key.`);
      }
      throw new Error(
        `${PROVIDER_LABEL[provider]} validation is unavailable [${response.status}].`,
      );
    }
    return key;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`${PROVIDER_LABEL[provider]} validation timed out.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function saveProviderApiKey(provider: ApiProvider, rawKey: string, actor: string) {
  const key = await validateProviderApiKey(provider, rawKey);
  const existing = await findStoredSecret(provider);
  const encrypted = await encryptSecret(key, encryptionKey());
  const now = new Date().toISOString();
  await getDb()
    .insert(apiProviderSecrets)
    .values({
      provider,
      ...encrypted,
      lastFour: lastFour(key),
      updatedAt: now,
      updatedBy: actor,
      validatedAt: now,
      keyVersion: (existing?.keyVersion ?? 0) + 1,
    })
    .onConflictDoUpdate({
      target: apiProviderSecrets.provider,
      set: {
        ...encrypted,
        lastFour: lastFour(key),
        updatedAt: now,
        updatedBy: actor,
        validatedAt: now,
        keyVersion: (existing?.keyVersion ?? 0) + 1,
      },
    });
  await audit(provider, existing ? "rotated" : "created", actor);
}

export async function removeProviderApiKey(provider: ApiProvider, actor: string) {
  const existing = await findStoredSecret(provider);
  if (!existing) return;
  await getDb().delete(apiProviderSecrets).where(eq(apiProviderSecrets.provider, provider));
  await audit(provider, "removed", actor);
}

export async function getProviderApiKey(provider: ApiProvider) {
  try {
    const stored = await findStoredSecret(provider);
    if (stored) return decryptSecret(stored.ciphertext, stored.iv, encryptionKey());
  } catch (error) {
    if (!process.env[PROVIDER_ENV[provider]]) throw error;
  }
  const environmentKey = process.env[PROVIDER_ENV[provider]]?.trim();
  if (!environmentKey) throw new Error(`${PROVIDER_LABEL[provider]} is not configured yet.`);
  return environmentKey;
}

export async function getProviderStatuses() {
  let storageReady = true;
  let stored = new Map<ApiProvider, StoredSecret>();
  try {
    const rows = await getDb().select().from(apiProviderSecrets);
    stored = new Map(
      rows
        .filter((row): row is StoredSecret & { provider: ApiProvider } =>
          API_PROVIDERS.includes(row.provider as ApiProvider),
        )
        .map((row) => [row.provider, row]),
    );
  } catch {
    storageReady = false;
  }

  return {
    storageReady,
    providers: API_PROVIDERS.map((provider) => {
      const row = stored.get(provider);
      const environmentKey = process.env[PROVIDER_ENV[provider]]?.trim();
      return {
        provider,
        label: PROVIDER_LABEL[provider],
        configured: Boolean(row || environmentKey),
        source: row ? ("admin-panel" as const) : environmentKey ? ("environment" as const) : null,
        lastFour: row?.lastFour ?? (environmentKey ? lastFour(environmentKey) : null),
        updatedAt: row?.updatedAt ?? null,
        updatedBy: row?.updatedBy ?? null,
        validatedAt: row?.validatedAt ?? null,
      };
    }),
  };
}
