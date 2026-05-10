import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.105", "192.168.1.100", "178.105.52.161"],
  output: "standalone",
};

export default nextConfig;
