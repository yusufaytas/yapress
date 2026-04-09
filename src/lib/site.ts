import siteConfig from "@/site.config";

export function getAbsoluteUrl(pathname = "/") {
  const url = new URL(pathname, siteConfig.siteUrl);
  return url.toString();
}

export { siteConfig };

