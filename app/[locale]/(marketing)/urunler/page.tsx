import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { IconSolar } from "@/components/ui/icons";
import {
  getProductCategories,
  getProductGroups,
  type ProductGroupItem,
} from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildAlternates } from "@/lib/seo";
import styles from "./urunler.module.scss";

export const revalidate = 60;

type Translator = Awaited<ReturnType<typeof getTranslations<"Products">>>;

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

// "12 yıl ürün · 30 yıl performans garantisi" — localized from the numeric fields.
function warrantyLabel(t: Translator, g: ProductGroupItem): string | null {
  const parts: string[] = [];
  if (g.warrantyProductYears) parts.push(t("warrantyProduct", { years: g.warrantyProductYears }));
  if (g.warrantyPerformanceYears)
    parts.push(t("warrantyPerformance", { years: g.warrantyPerformanceYears }));
  return parts.length ? parts.join(" · ") : null;
}

// Known feature keys are localized; anything else (free text from the Studio)
// renders as-is.
function featureLabel(t: Translator, key: string): string {
  return t.has(`features.${key}`) ? t(`features.${key}`) : key;
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Products");

  const [categories, groups] = await Promise.all([getProductCategories(), getProductGroups()]);

  // Category sections in configured order; inside each, groups clustered by brand.
  const sections = categories
    .map((cat) => {
      const inCat = groups.filter((g) => g.category?._id === cat._id);
      const byBrand = new Map<string, ProductGroupItem[]>();
      for (const g of inCat) {
        const brand = g.brand?.title ?? "—";
        byBrand.set(brand, [...(byBrand.get(brand) ?? []), g]);
      }
      return { cat, brands: [...byBrand.entries()] };
    })
    .filter((s) => s.brands.length > 0);

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
        {sections.length === 0 ? (
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
          sections.map(({ cat, brands }) => (
            <div key={cat._id} className={styles.category}>
              <h2 className={styles.categoryTitle}>{cat.title}</h2>
              {brands.map(([brand, items]) => (
                <div key={brand} className={styles.brandBlock}>
                  <h3 className={styles.brandTitle}>{brand}</h3>
                  <ul className={styles.grid}>
                    {items.map((g) => {
                      const warranty = warrantyLabel(t, g);
                      const features = (g.features ?? []).slice(0, 3);
                      const productName = `${g.brand?.title ?? ""} ${g.title}`.trim();
                      return (
                        <li key={g._id} className={styles.card}>
                          <span className={styles.media}>
                            {g.image ? (
                              <Image
                                src={urlFor(g.image).width(640).height(440).url()}
                                alt={productName}
                                width={640}
                                height={440}
                                className={styles.img}
                              />
                            ) : (
                              <span className={styles.placeholder} aria-hidden="true">
                                <IconSolar size={34} />
                              </span>
                            )}
                          </span>
                          <div className={styles.body}>
                            <h4 className={styles.cardTitle}>{g.title}</h4>
                            <div className={styles.specs}>
                              {g.powerRange ? (
                                <span className={styles.spec}>{g.powerRange}</span>
                              ) : null}
                              {warranty ? <span className={styles.spec}>{warranty}</span> : null}
                            </div>
                            {features.length > 0 ? (
                              <ul className={styles.features}>
                                {features.map((f) => (
                                  <li key={f} className={styles.feature}>
                                    {featureLabel(t, f)}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                            <div className={styles.cta}>
                              <Button
                                href={{ pathname: "/contact", query: { urun: productName } }}
                                variant="secondary"
                                withArrow
                              >
                                {t("cardCta")}
                              </Button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ))
        )}
      </Section>
    </>
  );
}
