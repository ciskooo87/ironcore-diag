import type { NextConfig } from "next";

const basePath = (process.env.APP_BASE_PATH || "").trim();

const nextConfig: NextConfig = {
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
