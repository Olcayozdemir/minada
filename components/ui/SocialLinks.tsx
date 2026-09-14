import type { CSSProperties } from "react";
import { IconFacebook, IconInstagram, IconLinkedin } from "@/components/ui/icons";
import { SITE } from "@/lib/site";

/**
 * Every social account we actually have, in one place.
 *
 * Driven off SITE.social rather than written out per surface, so the social
 * rail and footer cannot drift apart. An account that has not opened yet costs
 * nothing: leave its entry empty in site.ts and it is skipped here and in the
 * JSON-LD sameAs alike.
 *
 * A fragment of anchors, not a wrapper: both callers already put these
 * inside their own flex row and set the chip styling themselves.
 */
const ACCOUNTS = [
  { key: "instagram", label: "Instagram", Icon: IconInstagram, color: "#e1306c" },
  { key: "facebook", label: "Facebook", Icon: IconFacebook, color: "#1877f2" },
  { key: "linkedin", label: "LinkedIn", Icon: IconLinkedin, color: "#0a66c2" },
] as const;

export function SocialLinks({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <>
      {ACCOUNTS.filter(({ key }) => SITE.social[key]).map(({ key, label, Icon, color }) => (
        <a
          key={key}
          href={SITE.social[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={className}
          style={{ "--social-color": color } as CSSProperties}
        >
          <Icon size={size} />
        </a>
      ))}
    </>
  );
}
