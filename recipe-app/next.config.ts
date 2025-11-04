import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude native modules from webpack bundling on the server
      // They will be loaded natively by Node.js at runtime
      config.externals = config.externals || [];
      
      // Mark re2 and its native dependencies as external
      config.externals.push({
        're2': 'commonjs re2',
        './build/Release/re2.node': 'commonjs ./build/Release/re2.node',
      });
      
      // Also mark as external using a function to catch all re2 imports
      config.externals.push((context: { request?: string }, callback: (err?: Error | null, result?: string) => void) => {
        if (context.request && context.request.includes('re2.node')) {
          return callback(null, `commonjs ${context.request}`);
        }
        callback();
      });
      
    }
    
    return config;
  },
  // Mark packages with native dependencies as external for server components
  serverComponentsExternalPackages: ['re2', 'metascraper'],
};

export default nextConfig;
