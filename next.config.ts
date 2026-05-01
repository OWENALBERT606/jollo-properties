import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 public CDN
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      // Unsplash CDN (seed images)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Fallback: any https host
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
