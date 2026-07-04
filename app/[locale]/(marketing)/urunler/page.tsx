import type { Metadata } from "next";
import type { ComponentType } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import {
  IconSolar,
  IconBolt,
  IconBattery,
  IconActivity,
  IconPackage,
  IconGroundMount,
  IconHeatPump,
  IconEvCharge,
  IconBulb,
  IconArrowRight,
} from "@/components/ui/icons";
import { getProductCategories, getProductGroups } from "@/sanity/queries";
import { buildAlternates } from "@/lib/seo";
import styles from "./urunler.module.scss";

export const revalidate = 60;

// Category `icon` key (from the catalog data) → icon component.
const CAT_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  panel: IconSolar,
  inverter: IconBolt,
  battery: IconBattery,
  controller: IconActivity,
  package: IconPackage,
  mounting: IconGroundMount,
  heatpump: IconHeatPump,
  evcharge: IconEvCharge,
  lighting: IconBulb,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Products" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/urunler", locale),
  };
}

export default async function ProductsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Products");

  const [categories, groups] = await Promise.all([getProductCategories(), getProductGroups()]);

  // Show only categories that actually have visible products; carry the count.
  const cats = categories
    .map((cat) => ({ cat, count: groups.filter((g) => g.category?._id === cat._id).length }))
    .filter((c) => c.count > 0);

  return (
    <>
      <Section tone="dark">
        <SectionHeading
          as="h1"
          tone="dark"
          eyebrow={t("eyebrow")}
          title={t("title")}
          intro={t("intro")}
        />
      </Section>

      <Section tone="light">
        {cats.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{t("emptyTitle")}</p>
            <p className={styles.emptyDesc}>{t("emptyDesc")}</p>
            <div className={styles.emptyCta}>
              <Button href="/contact" withArrow>
                {t("emptyCtaLabel")}
              </Button>
            </div>
          </div>
        ) : (
          <ul className={styles.catGrid}>
            {cats.map(({ cat, count }) => {
              const Icon = CAT_ICONS[cat.icon ?? ""] ?? IconSolar;
              const title = t.has(`categories.${cat.slug}`)
                ? t(`categories.${cat.slug}`)
                : cat.title;
              const desc = t.has(`catDesc.${cat.slug}`) ? t(`catDesc.${cat.slug}`) : "";
              return (
                <li key={cat._id}>
                  <Link
                    href={{ pathname: "/urunler/[category]", params: { category: cat.slug } }}
                    className={styles.catCard}
                  >
                    <span className={styles.catIcon}>
                      <Icon size={26} />
                    </span>
                    <span className={styles.catCount}>{t("countLabel", { count })}</span>
                    <span className={styles.catCardTitle}>{title}</span>
                    {desc ? <span className={styles.catDesc}>{desc}</span> : null}
                    <span className={styles.catGo} aria-hidden="true">
                      <IconArrowRight size={16} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </>
  );
}
