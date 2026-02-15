import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ['pdf-parse'],
    // In Next.js 16, turbo is moved to the top level 'turbopack' key
    turbopack: {
        resolveAlias: {
            // Your aliases here    
        },
    },
};

export default nextConfig;