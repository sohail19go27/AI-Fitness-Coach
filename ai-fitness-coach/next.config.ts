import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set turbopack.root to the current package to avoid workspace-root inference warnings
  // This helps when there are multiple lockfiles in parent directories.
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
  turbopack: {
    root: ".",
  } as any,
};

export default nextConfig;
