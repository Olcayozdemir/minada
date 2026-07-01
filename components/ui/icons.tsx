import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/* --- Services --- */
export const IconSolar = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="17.5" cy="6.5" r="2.6" />
    <path d="M17.5 1.8v1M22.2 6.5h-1M17.5 11.2v-1M12.8 6.5h1M20.8 3.2l-.7.7M14.2 3.2l.7.7" />
    <path d="M3 20l2.4-8.4a1.4 1.4 0 0 1 1.35-1H12a1.4 1.4 0 0 1 1.35 1L15.8 20z" />
    <path d="M3.6 17h11.6M9.4 10.6V20" />
  </Svg>
);
export const IconBattery = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="7" width="15" height="10" rx="2" />
    <path d="M21 10.5v3" />
    <path d="M10.6 9.6L8.6 12.4h2.8l-2 2.8" />
  </Svg>
);
export const IconEvCharge = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 21V6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15" />
    <path d="M3 21h13" />
    <path d="M14 9h2.6a1.6 1.6 0 0 1 1.6 1.6V15a1.6 1.6 0 0 0 1.6 1.6A1.6 1.6 0 0 0 21 15V9.6L18.4 7" />
    <path d="M9.4 8L7.6 10.8h2.4l-1.8 2.6" />
  </Svg>
);
export const IconHeatPump = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="12" cy="12" r="3.4" />
    <path d="M12 8.6c1.6.5 1.6 2.3 0 3.4M12 15.4c-1.6-.5-1.6-2.3 0-3.4M8.6 12c.5-1.6 2.3-1.6 3.4 0" />
  </Svg>
);

/* --- Process --- */
export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Svg>
);
export const IconBlueprint = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 3h9l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M14 3v5h5" />
    <path d="M8 13h8M8 17h5" />
  </Svg>
);
export const IconInstall = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.7 6.3a3.6 3.6 0 0 0-4.9 4.9l-6 6L6 19.3l6-6a3.6 3.6 0 0 0 4.9-4.9l-2.2 2.2-2-2z" />
  </Svg>
);
export const IconSupport = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
    <rect x="2.5" y="13" width="4" height="6" rx="1.4" />
    <rect x="17.5" y="13" width="4" height="6" rx="1.4" />
    <path d="M20 19a3 3 0 0 1-3 3h-3" />
  </Svg>
);

/* --- Application areas --- */
export const IconHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 11.5L12 4l8 7.5" />
    <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
    <path d="M10 20v-5h4v5" />
  </Svg>
);
export const IconBuilding = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
    <path d="M10 21v-3h4v3" />
  </Svg>
);
export const IconLeaf = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 4S9 3 5.5 9.5 8 20 8 20s8-1.5 10.5-6S20 4 20 4z" />
    <path d="M8 20c1-6 4.5-10 9-12" />
  </Svg>
);
export const IconLandmark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9l9-5 9 5" />
    <path d="M4 9h16" />
    <path d="M6 9v8M10 9v8M14 9v8M18 9v8" />
    <path d="M3 21h18" />
  </Svg>
);

/* --- Misc --- */
export const IconCalculator = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <rect x="8" y="6" width="8" height="3.5" rx="0.6" />
    <path d="M8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01M8.5 17h.01M12 17h.01M15.5 17h.01" />
  </Svg>
);
export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12.5l5 5 11-11" />
  </Svg>
);
export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const IconBolt = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12z" />
  </Svg>
);
export const IconShield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);
export const IconStar = (p: IconProps) => (
  <Svg fill="currentColor" stroke="none" {...p}>
    <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z" />
  </Svg>
);
