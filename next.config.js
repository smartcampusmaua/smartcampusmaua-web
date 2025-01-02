/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: '/', // base URL
        destination: '/login', // target path
        permanent: false, // makes the redirect permanent (use 308 status)
      },
    ];
  },
};

module.exports = nextConfig
