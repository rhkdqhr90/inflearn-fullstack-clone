import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    optimizePackageImports: ["ckeditor5", "@ckeditor/ckeditor5-react"],
    workerThreads: false,
    cpus: 1,
  },
  images: {
    remotePatterns: [
      ...(process.env.CLOUDFRONT_DOMAIN
        ? [
            {
              protocol: "https" as const,
              hostname: process.env.CLOUDFRONT_DOMAIN as string,
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: "cdn.inflearn.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.cache = false;
      config.optimization = {
        ...config.optimization,
        minimize: true,
        moduleIds: "deterministic",
      };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      ckeditor5: require.resolve("ckeditor5"),
    };

    return config;
  },
};
//
export default nextConfig;
