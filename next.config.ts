import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Character art (see src/lib/images.ts).
    remotePatterns: [new URL("https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/image/**")],
  },
};

export default nextConfig;
