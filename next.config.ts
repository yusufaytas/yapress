import type { NextConfig } from "next";

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
      return [
        {
          source: "/feed",
          destination: "/rss.xml",
          permanent: true
        },
        {
          source: "/feed/",
          destination: "/rss.xml",
          permanent: true
        },
        {
          source: "/category/:slug",
          destination: "/categories/:slug",
          permanent: true
        },
        {
          source: "/tag/:slug",
          destination: "/tags/:slug",
          permanent: true
        },
        {
          source: "/wp-content/uploads/:path*",
          destination: "/images/:path*",
          permanent: true
        }
      ];
    },
  }),
};

export default nextConfig;
