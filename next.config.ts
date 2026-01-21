import type { NextConfig } from "next";

const csp = [
  // "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: https:",
  "connect-src 'self' https://*",
  "font-src 'self' https: data:",
  // "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "block-all-mixed-content",
  // "upgrade-insecure-requests"
].join('; ');

const nextConfig: NextConfig = {
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value: csp,
  //         },
  //         { key: "X-Content-Type-Options", value: "nosniff" },
  //         // { key: "X-Frame-Options", value: "SAMEORIGIN" },
  //         { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  //         {
  //           key: "Permissions-Policy",
  //           value: "geolocation=(), microphone=(), camera=()",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
