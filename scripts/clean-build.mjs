import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

for (const directory of [".next", "out"]) {
  fs.rmSync(path.join(root, directory), { recursive: true, force: true });
}

console.log("Cleaned previous build artifacts.");
