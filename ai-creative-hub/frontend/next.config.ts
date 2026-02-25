import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API proxy for development - only proxy to backend for non-local API routes
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || apiUrl === "http://localhost:8000") {
      // In development or without external API, use local API routes
      return [];
    }
    return [
      {
        source: "/api/backend/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },

  // Allowed hosts for preview environment
  allowedDevOrigins: [".monkeycode-ai.online", ".vercel.app"],

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
