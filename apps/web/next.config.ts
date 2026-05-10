import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com", "lh3.googleusercontent.com"],
  },
  transpilePackages: ["@duohome/types"],
};

export default nextConfig;
