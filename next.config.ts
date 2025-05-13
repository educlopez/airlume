import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: "github.com" },
    ],
  },
};

export default nextConfig;
