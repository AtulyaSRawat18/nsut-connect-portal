import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NSUT_BUILD_DIR || ".next",
};

export default nextConfig;
