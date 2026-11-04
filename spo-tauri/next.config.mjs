/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

