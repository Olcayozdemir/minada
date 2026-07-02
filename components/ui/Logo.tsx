import Image from "next/image";
import { Link } from "@/i18n/navigation";
import styles from "./Logo.module.scss";

// Real MİNADA mark (navy double-M with gold panel stroke) on a white chip so it
// stays legible over photos, glass and dark surfaces alike.
export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <Link href="/" className={styles.logo} aria-label="MİNADA">
      <span className={styles.chip}>
        <Image src="/logo/logo.png" alt="" width={30} height={30} className={styles.img} />
      </span>
      {withWordmark && <span className={styles.word}>MİNADA</span>}
    </Link>
  );
}
