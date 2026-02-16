/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-parse'],
  // Next.js 16: turbopack is top-level
  turbopack: {
    resolveAlias: {},
  },
};

export default nextConfig;
