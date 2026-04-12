import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);

  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  return match.slice(1).map(Number);
}

function compareVersions(left, right) {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);

  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] > rightParts[index]) {
      return 1;
    }

    if (leftParts[index] < rightParts[index]) {
      return -1;
    }
  }

  return 0;
}

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

let publishedVersion = null;

try {
  const output = execFileSync(
    "npm",
    ["view", packageJson.name, "version", "--json"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  ).trim();

  if (output) {
    publishedVersion = JSON.parse(output);
  }
} catch {
  publishedVersion = null;
}

if (!publishedVersion || compareVersions(publishedVersion, packageJson.version) <= 0) {
  console.log(
    `Keeping local release base ${packageJson.version}${publishedVersion ? ` (registry: ${publishedVersion})` : ""}`,
  );
  process.exit(0);
}

execFileSync(
  "npm",
  ["version", publishedVersion, "--no-git-tag-version", "--allow-same-version"],
  { stdio: "inherit" },
);

console.log(`Synced release base to published version ${publishedVersion}`);
