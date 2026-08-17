import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8080" },
      { protocol: "http", hostname: "54.116.18.212" },
    ],
    // Next 16부터 사설 IP(localhost 등)로 연결되는 이미지는 최적화가 막힌다(SSRF 방어).
    // 개발할 때만 백엔드가 localhost:8080이라 여기 걸리므로, 개발 환경에서만 열어준다.
    // 운영은 Nginx 뒤 같은 오리진이라 이 설정이 필요 없다.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
