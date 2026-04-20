import type { NextConfig } from "next";

import { getAppRedirects } from "./src/lib/redirects";

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // Redirects only work in dev mode with output: export
  // In production, vercel.json handles redirects
  ...(process.env.NODE_ENV === "development" && {
    async redirects() {
      return getAppRedirects();
    },
  }),
};

export default nextConfig;
