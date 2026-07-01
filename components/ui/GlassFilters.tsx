// Global SVG filter defs referenced by CSS (backdrop-filter: url(#glassDistort))
// and by decorative graphics. Rendered once, near the top of <body>.
export function GlassFilters() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* Refractive frosted glass: noise -> displacement of the backdrop. */}
        <filter
          id="glassDistort"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.009 0.014"
            numOctaves="2"
            seed="14"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="1.1" result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale="20"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Soft elevation shadow for floating graphics (hero panel). */}
        <filter id="softDrop" x="-40%" y="-30%" width="180%" height="190%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="20" stdDeviation="20" floodColor="#03141a" floodOpacity="0.6" />
        </filter>
      </defs>
    </svg>
  );
}
