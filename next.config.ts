import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 90 is used by the full-screen art viewer.
    qualities: [75, 90],
  },
};

export default nextConfig;
