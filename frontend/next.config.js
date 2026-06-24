/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, path: false, crypto: false,
        encoding: false, "node-fetch": false,
      };
    }
    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "photostudiokathmandu.com" },
      { protocol: "https", hostname: "www.alfaazphotography.com" },
      { protocol: "https", hostname: "www.weddingkathmandu.com" },
      { protocol: "https", hostname: "www.bihebazaar.com" },
      { protocol: "https", hostname: "blogger.googleusercontent.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "t3.ftcdn.net" },
    ],
  },
  env: {
    // These fallback to localhost if not set (good for development)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    NEXT_PUBLIC_AI_URL:  process.env.NEXT_PUBLIC_AI_URL  || "http://localhost:8000",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
};

module.exports = nextConfig;
