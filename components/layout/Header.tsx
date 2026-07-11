import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/lib/site";
import { HeaderShell } from "./HeaderShell";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";
import styles from "./Header.module.scss";

export async function Header() {
  const t = await getTranslations("Nav");
  const tc = await getTranslations("Common");

  // Mobile drawer: dropdown columns become titled groups, the rest one flat group.
  const mobileGroups = [
    ...NAV_ITEMS.flatMap((i) =>
      "columns" in i
        ? i.columns.map((col) => ({
            title: t(col.key),
            items: col.children.map((c) => ({ href: c.href, label: t(c.key) })),
          }))
        : [],
    ),
    {
      items: NAV_ITEMS.flatMap((i) =>
        "columns" in i ? [] : [{ href: i.href, label: t(i.key) }],
      ),
    },
  ];

  return (
    <header className={styles.header}>
      <HeaderShell>
        <div className={styles.inner}>
          <div className={styles.pill}>
            <Logo />

            <nav className={styles.nav} aria-label="Primary">
              {NAV_ITEMS.map((i) =>
                "columns" in i ? (
                  <div key={i.key} className={styles.group}>
                    <span className={styles.link} aria-hidden="true">
                      {t(i.key)}
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path
                          d="M2 3.5l3 3 3-3"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div className={styles.dropdown}>
                      {i.columns.map((col) => (
                        <div key={col.key} className={styles.dropCol}>
                          <span className={styles.dropColTitle}>{t(col.key)}</span>
                          {col.children.map((c) => (
                            <Link key={c.href} href={c.href} className={styles.dropLink}>
                              {t(c.key)}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link key={i.href} href={i.href} className={styles.link}>
                    {t(i.key)}
                  </Link>
                ),
              )}
            </nav>

            <div className={styles.actions}>
              <span className={styles.langDesktop}>
                <LanguageSwitcher />
              </span>
              <span className={styles.ctaDesktop}>
                <Button href="/contact">{tc("getQuoteShort")}</Button>
              </span>
              <MobileNav
                groups={mobileGroups}
                cta={tc("getQuoteShort")}
                menuLabel={tc("openMenu")}
                closeLabel={tc("closeMenu")}
              />
            </div>
          </div>
        </div>
      </HeaderShell>
    </header>
  );
}
