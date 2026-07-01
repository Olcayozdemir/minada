import { Link } from "@/i18n/navigation";
import styles from "./Logo.module.scss";

// Placeholder MİNADA mark (abstract M/A + harbor dot). The final logo files
// (SVG/PNG, light + dark) will be dropped in later per the roadmap.
export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <Link href="/" className={styles.logo} aria-label="MİNADA">
      <svg className={styles.mark} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="11"
          fill="rgba(242,168,44,0.1)"
          stroke="var(--gold)"
          strokeOpacity="0.55"
        />
        <path
          d="M9 28V13l6 8 5-8"
          stroke="var(--paper)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 28l6-15 6 15"
          stroke="var(--gold-300)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="26" cy="27" r="2.3" fill="var(--gold-300)" />
      </svg>
      {withWordmark && <span className={styles.word}>MİNADA</span>}
    </Link>
  );
}
