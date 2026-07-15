import type { NextConfig } from "next";

const upstreamApiUrl = process.env.API_URL?.trim().replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!upstreamApiUrl) {
      return [];
    }

    return [
      {
        source: "/backend/:path*",
        destination: `${upstreamApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
