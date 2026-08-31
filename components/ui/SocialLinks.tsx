import { IconFacebook, IconInstagram, IconLinkedin } from "@/components/ui/icons";
import { SITE } from "@/lib/site";

/**
 * Every social account we actually have, in one place.
 *
 * Driven off SITE.social rather than written out per surface, so the header,
 * the mobile drawer and the footer cannot drift apart, and so an account that
 * has not opened yet costs nothing: leave its entry empty in site.ts and it is
 * skipped here and in the JSON-LD sameAs alike. LinkedIn is sitting in exactly
 * that state.
 *
 * A fragment of anchors, not a wrapper: all three callers already put these
 * inside their own flex row and set the chip styling themselves.
 */
const ACCOUNTS = [
  { key: "instagram", label: "Instagram", Icon: IconInstagram },
  { key: "facebook", label: "Facebook", Icon: IconFacebook },
  { key: "linkedin", label: "LinkedIn", Icon: IconLinkedin },
] as const;

export function SocialLinks({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <>
      {ACCOUNTS.filter(({ key }) => SITE.social[key]).map(({ key, label, Icon }) => (
        <a
          key={key}
          href={SITE.social[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={className}
        >
          <Icon size={size} />
        </a>
      ))}
    </>
  );
}
