import siteConfig from "@/site.config";

function getCanonicalHostVariants() {
  const canonicalHost = new URL(siteConfig.siteUrl).hostname;
  const variants = new Set([canonicalHost]);

  if (canonicalHost.startsWith("www.")) {
    variants.add(canonicalHost.slice(4));
  } else {
    variants.add(`www.${canonicalHost}`);
  }

  return variants;
}

function isFileLikePath(pathname: string) {
  return /\.[a-z0-9]{1,8}$/i.test(pathname.split("/").pop() ?? "");
}

export function normalizeCanonicalPath(pathname = "/") {
  const normalizedInput =
    !/^[a-z][a-z0-9+.-]*:\/\//i.test(pathname) && pathname.startsWith("//")
      ? `/${pathname.replace(/^\/+/, "")}`
      : pathname;
  const url = new URL(normalizedInput, siteConfig.siteUrl);
  const normalizedPathname = url.pathname.replace(/\/{2,}/g, "/");
  const trimmedPathname =
    normalizedPathname !== "/" && !isFileLikePath(normalizedPathname)
      ? normalizedPathname.replace(/\/+$/g, "")
      : normalizedPathname;

  const resolvedPathname = trimmedPathname || "/";
  return `${resolvedPathname}${url.search}${url.hash}`;
}

export function getAbsoluteUrl(pathname = "/") {
  const url = new URL(normalizeCanonicalPath(pathname), siteConfig.siteUrl);
  return url.toString();
}

export function normalizeInternalAbsoluteUrl(input: string) {
  let parsed: URL;

  try {
    parsed = new URL(input);
  } catch {
    return input;
  }

  if (!/^https?:$/i.test(parsed.protocol)) {
    return input;
  }

  if (!getCanonicalHostVariants().has(parsed.hostname)) {
    return input;
  }

  return getAbsoluteUrl(`${parsed.pathname}${parsed.search}${parsed.hash}`);
}

export { siteConfig };
