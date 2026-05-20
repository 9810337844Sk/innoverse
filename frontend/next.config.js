/** @type {import('next').NextConfig} */
const nextConfig = {
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
    domains: ["res.cloudinary.com", "s3.amazonaws.com", "localhost", "picsum.photos", "photostudiokathmandu.com", "www.alfaazphotography.com", "www.weddingkathmandu.com", "www.bihebazaar.com", "blogger.googleusercontent.com", "i.pinimg.com", "t3.ftcdn.net"],
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
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    NEXT_PUBLIC_AI_URL:  process.env.NEXT_PUBLIC_AI_URL  || "http://localhost:8000",
  },
};

module.exports = nextConfig;
