import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Sandboxed agents can't delete pre-existing files in the mounted repo, so
  // they build into a throwaway dir via NEXT_DIST_DIR (defaults to .next).
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  turbopack: {
    root: import.meta.dirname,
  },
  sassOptions: {
    quietDeps: true,
  },
  experimental: {
    // Shared-element morphs between the Çözümler cards and the line pages.
    // Browsers without the View Transitions API navigate normally, unanimated.
    viewTransition: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    // Largest source asset is 2400px — serving 2K+ variants is wasted bytes
    // (and some constrained renderers refuse to composite ≥2048px decodes).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // The isometric renders are large soft gradients over near-white, which is
    // the worst case for lossy encoding: at DPR 1 the delivered WebP is shown
    // near 1:1 with no downscale to hide banding. 75 was visibly breaking up on
    // a non-retina monitor. Next 16 requires the allowlist, so 90 is declared
    // here and asked for per-image; everything else stays on the default.
    qualities: [75, 90],
  },
};

export default withNextIntl(nextConfig);
