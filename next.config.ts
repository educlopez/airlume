import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: "github.com" },
    ],
  },
};

export default nextConfig;
