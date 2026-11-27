import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rozhraní se vykresluje mimo React, dvojí spuštění ve vývoji by ho zdvojilo
  reactStrictMode: false,
};

export default nextConfig;
