import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const siteConfigSource = fs.readFileSync(path.join(root, "site.config.ts"), "utf8");

function readRedirectsFromSiteConfig(source) {
  const redirectsBlockMatch = source.match(/redirects:\s*\[([\s\S]*?)\][\s,]*\n\s*wordpress:/);
  if (!redirectsBlockMatch) {
    return [];
  }

  const uncommentedBlock = redirectsBlockMatch[1]
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");

  return [...uncommentedBlock.matchAll(/source:\s*"([^"]+)"\s*,\s*destination:\s*"([^"]+)"(?:\s*,\s*permanent:\s*(true|false))?/g)].map((match) => ({
    source: match[1],
    destination: match[2],
    permanent: match[3] == null ? true : match[3] === "true",
  }));
}

const redirects = readRedirectsFromSiteConfig(siteConfigSource);

fs.writeFileSync(
  path.join(root, "vercel.json"),
  `${JSON.stringify({ redirects }, null, 2)}\n`
);

console.log(`Generated vercel.json with ${redirects.length} redirects.`);
