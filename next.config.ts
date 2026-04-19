import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel автоматически определяет настройки
  // Убираем 'export', чтобы использовать SSR возможности Vercel
  trailingSlash: false,
};

export default nextConfig;
