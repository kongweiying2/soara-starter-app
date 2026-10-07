import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  experimental: { serverActions: { bodySizeLimit: "11mb" } },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
