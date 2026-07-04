import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { CategoryGrid } from "@/components/marketing/CategoryGrid";
import { getProductCategories, getProductGroups } from "@/sanity/queries";
import { buildAlternates } from "@/lib/seo";
import styles from "./urunler.module.scss";

export const revalidate = 60;

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
      <Section tone="dark" className={styles.pageHead}>
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
          <CategoryGrid items={cats} />
        )}
      </Section>
    </>
  );
}
