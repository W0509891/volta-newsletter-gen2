import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    // allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(";"),
    allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(";"),
    distDir:
        process.env.NODE_ENV === "production"
            ? ".next-prod"
            : ".next-dev",
};

export default nextConfig;
