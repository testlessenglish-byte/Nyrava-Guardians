import test from "node:test";
import assert from "node:assert/strict";
import { publicSupabaseConfig } from "../src/integrations/supabase/config.ts";

test("missing configuration gives an actionable error", () => {
  assert.throws(() => publicSupabaseConfig(), /VITE_SUPABASE_URL/);
});
test("publishable keys and HTTPS endpoints are accepted", () => {
  assert.equal(
    publicSupabaseConfig("https://example.supabase.co", "sb_publishable_test").url,
    "https://example.supabase.co",
  );
});
test("server secrets are rejected without echoing their value", () => {
  assert.throws(
    () => publicSupabaseConfig("https://example.supabase.co", "sb_secret_test"),
    /server secret/,
  );
});
test("legacy anon keys work, but service-role JWTs do not", () => {
  const key = (role) =>
    `header.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;
  assert.equal(publicSupabaseConfig("https://example.supabase.co", key("anon")).key, key("anon"));
  assert.throws(
    () => publicSupabaseConfig("https://example.supabase.co", key("service_role")),
    /anon or publishable/,
  );
});
test("remote HTTP is rejected while local Supabase is accepted", () => {
  assert.throws(
    () => publicSupabaseConfig("http://example.supabase.co", "sb_publishable_test"),
    /HTTPS/,
  );
  assert.equal(
    publicSupabaseConfig("http://127.0.0.1:54321", "sb_publishable_test").url,
    "http://127.0.0.1:54321",
  );
});
