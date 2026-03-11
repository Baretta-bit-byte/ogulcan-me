import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: "export",
  trailingSlash: true,
  // Next.js image optimization requires a server; disable for static export
  images: { unoptimized: true },
  // react-force-graph-2d uses canvas, needs transpilation
  transpilePackages: ["react-force-graph-2d", "force-graph", "three"],
};

export default nextConfig;
