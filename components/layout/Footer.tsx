import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/ui/Logo";
import { Link } from "@/i18n/navigation";
import { IconInstagram, IconLinkedin } from "@/components/ui/icons";
import { SITE, SERVICES, whatsappLink } from "@/lib/site";
import styles from "./Footer.module.scss";

export async function Footer() {
  const t = await getTranslations("Footer");
  const tn = await getTranslations("Nav");
  const ts = await getTranslations("Services");
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.ghost} aria-hidden="true">
        MİNADA
      </div>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Logo />
            <p className={styles.tagline}>{t("tagline")}</p>
            <div className={styles.social}>
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={styles.socialLink}
              >
                <IconInstagram size={18} />
              </a>
              <a
                href={SITE.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className={styles.socialLink}
              >
                <IconLinkedin size={18} />
              </a>
            </div>
          </div>

          <nav className={styles.col} aria-label={t("servicesTitle")}>
            <h3 className={styles.colTitle}>{t("servicesTitle")}</h3>
            {SERVICES.map((s) => (
              <Link key={s} href="/services" className={styles.colLink}>
                {ts(s)}
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
            <Link href="/how-it-works" className={styles.colLink}>
              {tn("howItWorks")}
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
            <p className={styles.note}>{t("placeholderNote")}</p>
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
          </div>
        </div>
      </div>
    </footer>
  );
}
