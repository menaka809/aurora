import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The demo is open (no sign-in); keep old /login links working.
  async redirects() {
    return [{ source: "/login", destination: "/", permanent: false }];
  },
};

export default nextConfig;
