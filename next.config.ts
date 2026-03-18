import type { NextConfig } from "next";

const basePath = (process.env.APP_BASE_PATH || "").trim();

const nextConfig: NextConfig = {
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
