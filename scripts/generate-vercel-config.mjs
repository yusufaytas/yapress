import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const siteConfigSource = fs.readFileSync(path.join(root, "site.config.ts"), "utf8");

function normalizePathname(pathname = "/") {
  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}` : "/";
}

function readRedirectsFromSiteConfig(source) {
  const redirectsBlockMatch = source.match(/redirects:\s*\[([\s\S]*?)\][\s,]*\n\s*wordpress:/);
  const uncommentedBlock = (redirectsBlockMatch?.[1] ?? "")
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");

  const siteRedirects = [...uncommentedBlock.matchAll(/source:\s*"([^"]+)"\s*,\s*destination:\s*"([^"]+)"(?:\s*,\s*permanent:\s*(true|false))?/g)].map((match) => ({
    source: match[1],
    destination: match[2],
    permanent: match[3] == null ? true : match[3] === "true",
  }));

  const categoryBaseMatch = source.match(/legacyCategoryBase:\s*"([^"]+)"/);
  const tagBaseMatch = source.match(/legacyTagBase:\s*"([^"]+)"/);
  const legacyCategoryBase = categoryBaseMatch?.[1] ?? "category";
  const legacyTagBase = tagBaseMatch?.[1] ?? "tag";

  const frameworkRedirects = [
    { source: "/feed", destination: "/rss.xml", permanent: true },
    { source: "/feed/", destination: "/rss.xml", permanent: true },
    { source: "/:slug/comment-page-:page", destination: "/:slug", permanent: true },
    { source: normalizePathname(`/${legacyCategoryBase}/:slug`), destination: "/categories/:slug", permanent: true },
    { source: normalizePathname(`/${legacyCategoryBase}/:slug/page/:page`), destination: "/categories/:slug", permanent: true },
    { source: normalizePathname(`/${legacyTagBase}/:slug`), destination: "/tags/:slug", permanent: true },
    { source: normalizePathname(`/${legacyTagBase}/:slug/page/:page`), destination: "/tags/:slug", permanent: true },
  ];

  return Array.from(
    new Map([...frameworkRedirects, ...siteRedirects].map((redirect) => [redirect.source, redirect])).values()
  );
}

const redirects = readRedirectsFromSiteConfig(siteConfigSource);

fs.writeFileSync(
  path.join(root, "vercel.json"),
  `${JSON.stringify({ redirects }, null, 2)}\n`
);

console.log(`Generated vercel.json with ${redirects.length} redirects.`);
