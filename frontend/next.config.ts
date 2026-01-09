import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // ✅ 300mb → 50mb로 감소
    },
    optimizePackageImports: ["ckeditor5", "@ckeditor/ckeditor5-react"], // ✅ CKEditor 최적화
    workerThreads: false, // ✅ 워커 스레드 비활성화 (메모리 절약)
    cpus: 1, // ✅ CPU 1개만 사용
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
  // ✅ Webpack 최적화 추가
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 서버 측 메모리 최적화
      config.cache = false; // 캐시 비활성화
      config.optimization = {
        ...config.optimization,
        minimize: true,
        moduleIds: "deterministic",
      };
    }

    // CKEditor 최적화
    config.resolve.alias = {
      ...config.resolve.alias,
      ckeditor5: require.resolve("ckeditor5"),
    };

    return config;
  },
};

export default withSentryConfig(nextConfig, {
  org: "gwangkyo",
  project: "inflearn-clone-web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});
