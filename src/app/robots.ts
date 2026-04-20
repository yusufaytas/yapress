import type { MetadataRoute } from "next";

import { getRobotsDisallow } from "@/lib/robots";
import { getAbsoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: getRobotsDisallow(),
    },
    sitemap: getAbsoluteUrl("/sitemap.xml")
  };
}
