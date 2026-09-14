import { SocialLinks } from "@/components/ui/SocialLinks";
import styles from "./SocialRail.module.scss";

/**
 * The social accounts as a fixed tab on the right edge of the viewport.
 *
 * They used to live in the header, which meant they were the first thing to be
 * dropped when the bar ran out of room: measured, the bar needs about 1125px
 * with them and about 1010px without, so between those widths they vanished,
 * and below 1024 they were only in the drawer, behind a tap. Out here they are
 * on every page at every width, phones included, and the header gets its space
 * back.
 *
 * Which accounts appear comes from SITE.social by way of SocialLinks, so
 * LinkedIn joins the stack the day its entry stops being an empty string.
 */
export function SocialRail() {
  return (
    <aside className={styles.rail} aria-label="MİNADA">
      <SocialLinks className={styles.link} size={24} />
    </aside>
  );
}
