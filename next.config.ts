import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  sassOptions: {
    quietDeps: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    // Largest source asset is 2400px — serving 2K+ variants is wasted bytes
    // (and some constrained renderers refuse to composite ≥2048px decodes).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};

export default withNextIntl(nextConfig);
