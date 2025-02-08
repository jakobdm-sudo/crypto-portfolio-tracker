/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore ESLint errors in production builds
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore TypeScript errors in production builds
  },
};

export default config;
