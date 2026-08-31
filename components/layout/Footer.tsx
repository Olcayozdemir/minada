import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/ui/Logo";
import { Link } from "@/i18n/navigation";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { SITE, BUSINESS_LINES, AUDIENCES, whatsappLink } from "@/lib/site";
import clsx from "clsx";
import { CookiePreferencesButton } from "@/components/consent/CookieConsent";
import styles from "./Footer.module.scss";

export async function Footer() {
  const t = await getTranslations("Footer");
  const tn = await getTranslations("Nav");
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.ghost} aria-hidden="true">
        MİNADA
      </div>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Logo tone="dark" />
            <p className={styles.tagline}>{t("tagline")}</p>
            <div className={styles.social}>
              <SocialLinks className={styles.socialLink} size={20} />
            </div>
          </div>

          <nav className={styles.col} aria-label={t("linesTitle")}>
            <h3 className={styles.colTitle}>{t("linesTitle")}</h3>
            {BUSINESS_LINES.map((l) => (
              <Link key={l.id} href={l.href} className={styles.colLink}>
                {tn(`line_${l.id}`)}
              </Link>
            ))}
          </nav>

          <nav className={styles.col} aria-label={t("forYouTitle")}>
            <h3 className={styles.colTitle}>{t("forYouTitle")}</h3>
            {AUDIENCES.map((a) => (
              <Link key={a.id} href={a.href} className={styles.colLink}>
                {tn(a.id)}
              </Link>
            ))}
          </nav>

          <nav className={styles.col} aria-label={t("companyTitle")}>
            <h3 className={styles.colTitle}>{t("companyTitle")}</h3>
            <Link href="/about" className={styles.colLink}>
              {tn("about")}
            </Link>
            <Link href="/projects" className={styles.colLink}>
              {tn("projects")}
            </Link>
            <Link href="/blog" className={styles.colLink}>
              {tn("blog")}
            </Link>
            <Link href="/faq" className={styles.colLink}>
              {tn("faq")}
            </Link>
          </nav>

          <div className={styles.contactCard}>
            <h3 className={styles.colTitle}>{t("contactTitle")}</h3>
            <a href={`mailto:${SITE.email}`} className={styles.contactLink}>
              {SITE.email}
            </a>
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className={styles.contactLink}>
              {SITE.phone}
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactLink}
            >
              WhatsApp
            </a>
            <a
              href={SITE.addressMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactLink}
            >
              {SITE.address}
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © {year} MİNADA Enerji. {t("rights")}
          </p>
          <div className={styles.legal}>
            <Link href="/privacy" className={styles.legalLink}>
              {t("privacy")}
            </Link>
            <Link href="/cookies" className={styles.legalLink}>
              {t("cookies")}
            </Link>
            <CookiePreferencesButton className={clsx(styles.legalLink, styles.legalButton)} />
          </div>
        </div>
      </div>
    </footer>
  );
}
