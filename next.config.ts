import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/es",
        destination: "/",
        permanent: true,
      },
      {
        source: "/es/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/fr/online-ping-website-tool",
        destination: "/tools/http-status-checker",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;