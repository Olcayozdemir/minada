import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import styles from "./Hero.module.scss";

export async function Hero() {
  const t = await getTranslations("Hero");
  const tc = await getTranslations("Common");

  const stats = [
    { v: t("statBillValue"), l: t("statBillLabel"), off: 20 },
    { v: t("statUptimeValue"), l: t("statUptimeLabel"), off: 4 },
    { v: t("statWarrantyValue"), l: t("statWarrantyLabel"), off: 34 },
    { v: t("statServicesValue"), l: t("statServicesLabel"), off: 45 },
  ];

  return (
    <section className={styles.hero}>
      <div className={styles.streak} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <h1 className={styles.title}>
              <span className={styles.lead}>{t("titleLead")}</span>
              <span className={styles.accent}>{t("titleAccent")}</span>
            </h1>
            <p className={styles.sub}>{t("subtitle")}</p>
            <div className={styles.actions}>
              <Button href="/contact" size="lg">
                {tc("getQuote")}
              </Button>
              <Button href="/calculator" size="lg" variant="secondary">
                {tc("calculate")} →
              </Button>
            </div>
          </div>

          <div className={styles.visual}>
            <Image
              src="/hero/hero-home.png"
              alt=""
              width={760}
              height={568}
              priority
              sizes="(max-width: 900px) 420px, 620px"
              className={styles.visualImg}
            />
          </div>
        </div>

        <ul className={styles.stats}>
          {stats.map((s) => (
            <li key={s.l} className={styles.stat}>
              <svg className={styles.ring} width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">
                <circle cx="23" cy="23" r="18" fill="none" stroke="rgba(240,247,242,0.12)" strokeWidth="3.4" />
                <circle
                  cx="23"
                  cy="23"
                  r="18"
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeDasharray="113"
                  strokeDashoffset={s.off}
                  transform="rotate(-90 23 23)"
                />
              </svg>
              <div>
                <div className={styles.statV}>{s.v}</div>
                <div className={styles.statL}>{s.l}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
