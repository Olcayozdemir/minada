import Image from "next/image";
import { Link } from "@/i18n/navigation";
import styles from "./Logo.module.scss";

// MİNADA mark (illustrated double-M — sunrise, hills and leaves) on a white chip
// so it stays legible over photos, glass and dark surfaces alike.
export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <Link href="/" className={styles.logo} aria-label="MİNADA">
      <span className={styles.chip}>
        <Image src="/logo/logo1.png" alt="" width={70} height={40} className={styles.img} />
      </span>
      {withWordmark && <span className={styles.word}>MİNADA</span>}
    </Link>
  );
}
