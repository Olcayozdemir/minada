import Image from "next/image";
import { ScrollTopLink } from "@/components/ui/ScrollTopLink";
import styles from "./Logo.module.scss";

// MİNADA mark (illustrated double-M — sunrise, hills and leaves) on a white chip
// so it stays legible over photos, glass and dark surfaces alike.
// Ana sayfadayken tıklama navigasyon yerine sayfayı en üste alır.
export function Logo({
  withWordmark = true,
  onClick,
}: {
  withWordmark?: boolean;
  onClick?: () => void;
}) {
  return (
    <ScrollTopLink href="/" className={styles.logo} aria-label="MİNADA" onClick={onClick}>
      <span className={styles.chip}>
        <Image src="/logo/logo1.png" alt="" width={70} height={40} className={styles.img} />
      </span>
      {withWordmark && <span className={styles.word}>MİNADA</span>}
    </ScrollTopLink>
  );
}
