import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  async redirects() {
    return [
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
  }
};

export default nextConfig;

