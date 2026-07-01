import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/lib/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";
import styles from "./Header.module.scss";

export async function Header() {
  const t = await getTranslations("Nav");
  const tc = await getTranslations("Common");
  const items = NAV_ITEMS.map((i) => ({ href: i.href, label: t(i.key) }));

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.bar}>
          <Logo />

          <nav className={styles.nav} aria-label="Primary">
            {items.map((i) => (
              <Link key={i.href} href={i.href} className={styles.link}>
                {i.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <span className={styles.langDesktop}>
              <LanguageSwitcher />
            </span>
            <span className={styles.ctaDesktop}>
              <Button href="/contact">{tc("getQuoteShort")}</Button>
            </span>
            <MobileNav
              items={items}
              cta={tc("getQuoteShort")}
              menuLabel={tc("openMenu")}
              closeLabel={tc("closeMenu")}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
