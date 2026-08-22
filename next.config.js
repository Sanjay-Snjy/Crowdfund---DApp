/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    domains: ["gateway.pinata.cloud", "ipfs.io", "cloudflare-ipfs.com", "cloudflare-ipfs.com"],
    unoptimized: true, // Required for static export compatibility
  },

  // Enable static export
  trailingSlash: true,

  // Webpack configuration for handling node modules in browser
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Environment variables
  env: {
    CUSTOM_KEY: "my-value",
  },

  // Updated experimental features (removed deprecated reactRoot)
  experimental: {
    // Modern experimental features for current Next.js versions
    serverComponentsExternalPackages: [],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
