import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import { BUSINESS_LINES } from "@/lib/site";
import { buildAlternates, faqLd } from "@/lib/seo";
import styles from "./faq.module.scss";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Faq" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/faq", locale),
  };
}

/**
 * Every question the site already answers, gathered in one place.
 *
 * The questions are not rewritten here: each group reads the same message keys
 * its own page reads, so an answer edited on the heat pump page changes here
 * too. That is also why the keys are uneven, with the heat pump nesting its set
 * under `faq.` and the rest keeping theirs flat: this follows the messages
 * rather than reshaping them.
 *
 * This is the only page on the site that emits FAQPage structured data. The
 * line pages deliberately do not, so the two cannot compete for the same rich
 * result with the same questions.
 */
const GROUPS = [
  { id: "general", ns: "Home.faq", prefix: "", items: ["cost", "payback", "warranty", "incentives"] },
  { id: "ges", ns: "Lines.ges", prefix: "", items: ["f1", "f2"] },
  { id: "bess", ns: "Lines.bess", prefix: "", items: ["f1", "f2"] },
  { id: "heatpump", ns: "Lines.heatpump", prefix: "faq.", items: ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"] },
  { id: "evcharge", ns: "Lines.evcharge", prefix: "", items: ["f1", "f2", "f3", "f4"] },
] as const;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Faq");
  const tNav = await getTranslations("Nav");

  const groups = await Promise.all(
    GROUPS.map(async (g) => {
      const tg = await getTranslations(g.ns);
      const line = BUSINESS_LINES.find((l) => l.id === g.id);
      return {
        id: g.id,
        title: line ? tNav(`line_${line.id}`) : t("generalTitle"),
        href: line?.href,
        items: g.items.map((i) => ({
          q: tg(`${g.prefix}${i}.q`),
          a: tg(`${g.prefix}${i}.a`),
        })),
      };
    }),
  );

  const all = groups.flatMap((g) => g.items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd(all)) }}
      />

      <Section tone="light">
        <div className={styles.page}>
          <SectionHeading title={t("title")} intro={t("intro")} as="h1" />

          {groups.map((g) => (
            <section key={g.id} className={styles.group}>
              <div className={styles.groupHead}>
                <h2 className={styles.groupTitle}>{g.title}</h2>
                {g.href ? (
                  <Link href={g.href} className={styles.groupLink}>
                    {t("lineLink")} <IconArrowRight size={15} />
                  </Link>
                ) : null}
              </div>

              <ul className={styles.list}>
                {g.items.map((item) => (
                  <li key={item.q}>
                    <details className={styles.item}>
                      <summary className={styles.summary}>{item.q}</summary>
                      <p className={styles.answer}>{item.a}</p>
                    </details>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Section>

      <Section tone="sand">
        <div className={styles.cta}>
          <SectionHeading title={t("ctaTitle")} intro={t("ctaDesc")} />
          <Button href="/contact" size="lg" withArrow>
            {t("ctaLabel")}
          </Button>
        </div>
      </Section>
    </>
  );
}
