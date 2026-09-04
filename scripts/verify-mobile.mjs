import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import assert from "node:assert/strict";

const root = resolve("dist-mobile");
const index = await readFile(join(root, "index.html"), "utf8");
assert.match(index, /<html/);
assert.match(index, /<script/);
const forbidden =
  /sb_secret_[A-Za-z0-9_-]+|SUPABASE_SERVICE_ROLE_KEY|API_KEY_ENCRYPTION_KEY|GROQ_API_KEY|GEMINI_API_KEY|postgres(?:ql)?:\/\//;
let count = 0;
async function inspect(dir) {
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    if ((await stat(path)).isDirectory()) await inspect(path);
    else {
      assert.ok(!name.startsWith(".env"), "Environment file found in mobile assets");
      if (/\.(?:js|mjs|html|json)$/.test(name)) {
        assert.ok(
          !forbidden.test(await readFile(path, "utf8")),
          `Server-only configuration in ${name}`,
        );
      }
      count++;
    }
  }
}
await inspect(root);
console.log(`Mobile shell and ${count} bundled assets verified; no private-key markers found.`);
