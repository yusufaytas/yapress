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
] as const;

export function getRobotsDisallow() {
  return [...new Set([
    ...defaultRobotsDisallow,
    ...(siteConfig.seo?.robots?.disallow ?? []),
  ])];
}
