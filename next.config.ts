import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Replace the default "X-Powered-By: Next.js" with our own playful headers.
  // Header values must stay ASCII (latin-1) — no emoji here.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Powered-By", value: "Next.js 16 + a humble Google Sheet" },
          // Classic dev easter egg (clacks.org) — keeps a name alive in transit.
          { key: "X-Clacks-Overhead", value: "GNU Terry Pratchett" },
          { key: "X-Built-With", value: "football, caffeine, and too many late nights" },
          { key: "X-Curious-Dev", value: "open the console for a hello (and a cheat code)" },
        ],
      },
    ];
  },
};

export default nextConfig;
