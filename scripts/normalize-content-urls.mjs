import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const siteConfigSource = fs.readFileSync(path.join(root, "site.config.ts"), "utf8");
const siteUrlMatch = siteConfigSource.match(/siteUrl:\s*"([^"]+)"/);

if (!siteUrlMatch) {
  throw new Error("Could not read siteUrl from site.config.ts.");
}

const canonicalSiteUrl = new URL(siteUrlMatch[1]);
const canonicalHost = canonicalSiteUrl.hostname;
const canonicalHosts = new Set(
  canonicalHost.startsWith("www.")
    ? [canonicalHost, canonicalHost.slice(4)]
    : [canonicalHost, `www.${canonicalHost}`]
);

function isFileLikePath(pathname) {
  return /\.[a-z0-9]{1,8}$/i.test(pathname.split("/").pop() ?? "");
}

function normalizeCanonicalPath(pathname = "/") {
  const url = new URL(pathname, canonicalSiteUrl);
  const normalizedPathname = url.pathname.replace(/\/{2,}/g, "/");
  const trimmedPathname =
    normalizedPathname !== "/" && !isFileLikePath(normalizedPathname)
      ? normalizedPathname.replace(/\/+$/g, "")
      : normalizedPathname;
  const resolvedPathname = trimmedPathname || "/";
  return `${resolvedPathname}${url.search}${url.hash}`;
}

function normalizeInternalAbsoluteUrl(input) {
  let parsed;

  try {
    parsed = new URL(input);
  } catch {
    return input;
  }

  if (!/^https?:$/i.test(parsed.protocol) || !canonicalHosts.has(parsed.hostname)) {
    return input;
  }

  return new URL(
    normalizeCanonicalPath(`${parsed.pathname}${parsed.search}${parsed.hash}`),
    canonicalSiteUrl
  ).toString();
}

function normalizeSource(source) {
  return source.replace(
    /https?:\/\/[^\s<)"'\]]+/g,
    (match) => normalizeInternalAbsoluteUrl(match)
  );
}

function walkMarkdownFiles(directory, result = []) {
  if (!fs.existsSync(directory)) {
    return result;
  }

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walkMarkdownFiles(fullPath, result);
      continue;
    }

    if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      result.push(fullPath);
    }
  }

  return result;
}

const targetDirectories = ["content", "content-starter"].map((directory) => path.join(root, directory));
const files = targetDirectories.flatMap((directory) => walkMarkdownFiles(directory));

let updatedCount = 0;

for (const filePath of files) {
  const source = fs.readFileSync(filePath, "utf8");
  const normalized = normalizeSource(source);

  if (normalized === source) {
    continue;
  }

  fs.writeFileSync(filePath, normalized);
  updatedCount += 1;
}

console.log(`Normalized same-site absolute URLs in ${updatedCount} files.`);
