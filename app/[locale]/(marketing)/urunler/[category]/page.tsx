import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { IconSolar } from "@/components/ui/icons";
import {
  getProductCategories,
  getProductGroups,
  type ProductGroupItem,
} from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { SITE_URL } from "@/lib/seo";
import styles from "../urunler.module.scss";

export const revalidate = 60;

type Translator = Awaited<ReturnType<typeof getTranslations<"Products">>>;

// "12 yıl ürün · 30 yıl performans garantisi" — localized from numeric fields.
function warrantyLabel(t: Translator, g: ProductGroupItem): string | null {
  const parts: string[] = [];
  if (g.warrantyProductYears) parts.push(t("warrantyProduct", { years: g.warrantyProductYears }));
  if (g.warrantyPerformanceYears)
    parts.push(t("warrantyPerformance", { years: g.warrantyPerformanceYears }));
  return parts.length ? parts.join(" · ") : null;
}

// Known feature keys are localized; anything else renders as-is.
function featureLabel(t: Translator, key: string): string {
  return t.has(`features.${key}`) ? t(`features.${key}`) : key;
}

function categoryLabel(t: Translator, slug: string, fallback: string): string {
  return t.has(`categories.${slug}`) ? t(`categories.${slug}`) : fallback;
}

export async function generateStaticParams() {
  const cats = await getProductCategories();
  return cats.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const [cats, t] = await Promise.all([
    getProductCategories(),
    getTranslations({ locale, namespace: "Products" }),
  ]);
  const cat = cats.find((c) => c.slug === category);
  if (!cat) return {};

  // Localized alternates for the dynamic route, built from the routing config
  // (tr: /urunler/[category], en: /products/[category]).
  const template = routing.pathnames["/urunler/[category]"] as Record<Locale, string>;
  const pathFor = (loc: Locale) => `/${loc}${template[loc].replace("[category]", category)}`;
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) languages[loc] = SITE_URL + pathFor(loc);
  languages["x-default"] = SITE_URL + pathFor(routing.defaultLocale);

  return {
    title: categoryLabel(t, cat.slug, cat.title),
    description: t.has(`catDesc.${cat.slug}`) ? t(`catDesc.${cat.slug}`) : undefined,
    alternates: { canonical: SITE_URL + pathFor(locale as Locale), languages },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Products");

  const [categories, groups] = await Promise.all([getProductCategories(), getProductGroups()]);
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  // Products in this category, clustered by brand (insertion order preserved).
  const inCat = groups.filter((g) => g.category?._id === cat._id);
  const byBrand = new Map<string, ProductGroupItem[]>();
  for (const g of inCat) {
    const brand = g.brand?.title ?? "—";
    byBrand.set(brand, [...(byBrand.get(brand) ?? []), g]);
  }
  const brands = [...byBrand.entries()];

  const title = categoryLabel(t, cat.slug, cat.title);
  const desc = t.has(`catDesc.${cat.slug}`) ? t(`catDesc.${cat.slug}`) : undefined;

  return (
    <>
      <Section tone="dark">
        <Link href="/urunler" className={styles.back}>
          {t("backToAll")}
        </Link>
        <SectionHeading as="h1" tone="dark" eyebrow={t("eyebrow")} title={title} intro={desc} />
      </Section>

      <Section tone="light">
        {brands.map(([brand, items]) => (
          <div key={brand} className={styles.brandBlock}>
            <h2 className={styles.brandTitle}>{brand}</h2>
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
                      <h3 className={styles.cardTitle}>{g.title}</h3>
                      <div className={styles.specs}>
                        {g.powerRange ? <span className={styles.spec}>{g.powerRange}</span> : null}
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
      </Section>
    </>
  );
}
