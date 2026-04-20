import siteConfig from "@/site.config";

export const defaultRobotsDisallow = [
  "/wp-admin/",
  "/wp-includes/",
  "/wp-content/plugins/",
  "/wp-content/themes/",
  "/xmlrpc.php",
  "/*?p=*",
  "/*?replytocom=*",
  "/*?utm_*",
  "/*&utm_*",
  "/*?fbclid=*",
  "/*&fbclid=*",
  "/*?gclid=*",
  "/*&gclid=*",
  "/*?ref=*",
  "/*&ref=*",
  "/*?cmid=*",
  "/*&cmid=*",
  "/*comment-page-*",
  "/_next/static/",
  "/favicon.ico",
  "/site.webmanifest",
  "/*.woff",
  "/*.woff2",
  "/*.ttf",
  "/*.eot",
  "/*/feed/",
  "/author/",
  "/search/",
] as const;

export function getRobotsDisallow() {
  return [...new Set([
    ...defaultRobotsDisallow,
    ...(siteConfig.seo?.robots?.disallow ?? []),
  ])];
}
