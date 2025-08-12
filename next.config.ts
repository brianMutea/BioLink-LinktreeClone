import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Suppress the specific Supabase realtime warning
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    return config;
  },
};

export default nextConfig;
