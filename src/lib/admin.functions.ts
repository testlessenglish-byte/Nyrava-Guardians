import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/admin-auth";
import {
  API_PROVIDERS,
  getProviderStatuses,
  removeProviderApiKey,
  saveProviderApiKey,
  validateProviderApiKey,
} from "@/lib/server/api-key-vault";

const accessSchema = z.object({ accessToken: z.string().min(20).max(4096) });
const providerSchema = z.enum(API_PROVIDERS);
const keySchema = accessSchema.extend({
  provider: providerSchema,
  apiKey: z.string().min(20).max(500),
});

export const getAIConfigurationStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => accessSchema.parse(data))
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.accessToken);
    return { ...(await getProviderStatuses()), administrator: admin.email };
  });

export const saveAIProviderKey = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => keySchema.parse(data))
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.accessToken);
    await saveProviderApiKey(data.provider, data.apiKey, admin.email);
    return getProviderStatuses();
  });

export const testAIProviderKey = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => keySchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    await validateProviderApiKey(data.provider, data.apiKey);
    return { valid: true };
  });

export const deleteAIProviderKey = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => accessSchema.extend({ provider: providerSchema }).parse(data))
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.accessToken);
    await removeProviderApiKey(data.provider, admin.email);
    return getProviderStatuses();
  });
