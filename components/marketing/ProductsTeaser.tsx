import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { CategoryGrid } from "@/components/marketing/CategoryGrid";
import { getProductCategories, getProductGroups } from "@/sanity/queries";
import styles from "./ProductsTeaser.module.scss";

// Homepage catalog teaser: the first catalog categories as 3D-render tiles,
// a brands line, and the "explore all products" CTA.
export async function ProductsTeaser() {
  const t = await getTranslations("Home.products");
  const [categories, groups] = await Promise.all([getProductCategories(), getProductGroups()]);

  const items = categories
    .map((cat) => ({ cat, count: groups.filter((g) => g.category?._id === cat._id).length }))
    .filter((c) => c.count > 0)
    .slice(0, 6);

  return (
    <Section tone="light">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />

      <div className={styles.gridWrap}>
        <CategoryGrid items={items} />
      </div>

      <div className={styles.footer}>
        <p className={styles.brands}>
          <span className={styles.brandsLabel}>{t("brandsLabel")}</span>
          <span className={styles.brandsList}>{t("brands")}</span>
        </p>
        <Button href="/urunler" size="lg" withArrow>
          {t("cta")}
        </Button>
      </div>
    </Section>
  );
}
