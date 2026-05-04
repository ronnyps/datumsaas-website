import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const targets = [".nuxt", ".output", "dist"];

for (const target of targets) {
  const absolutePath = resolve(process.cwd(), target);
  if (!existsSync(absolutePath)) continue;
  rmSync(absolutePath, { recursive: true, force: true });
  console.log(`[clean-static] removed ${target}`);
}
