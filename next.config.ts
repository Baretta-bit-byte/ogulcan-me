import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-force-graph-2d uses canvas, needs transpilation
  transpilePackages: ["react-force-graph-2d", "force-graph", "three"],
};

export default nextConfig;
