import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const apiProviderSecrets = sqliteTable("api_provider_secrets", {
  provider: text("provider").primaryKey(),
  ciphertext: text("ciphertext").notNull(),
  iv: text("iv").notNull(),
  lastFour: text("last_four").notNull(),
  updatedAt: text("updated_at").notNull(),
  updatedBy: text("updated_by").notNull(),
  validatedAt: text("validated_at").notNull(),
  keyVersion: integer("key_version").notNull().default(1),
});

export const apiSecretAudit = sqliteTable(
  "api_secret_audit",
  {
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    action: text("action").notNull(),
    actor: text("actor").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("api_secret_audit_provider_created_idx").on(table.provider, table.createdAt)],
);

export const aiRateLimits = sqliteTable("ai_rate_limits", {
  bucket: text("bucket").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: integer("expires_at").notNull(),
});
