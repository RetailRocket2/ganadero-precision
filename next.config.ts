import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for easy deployment
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;