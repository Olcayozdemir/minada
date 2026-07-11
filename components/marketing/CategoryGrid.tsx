import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import type { ProductCategoryItem } from "@/sanity/queries";
import { coverSrc } from "@/sanity/image";
import styles from "./CategoryGrid.module.scss";

// Built-in 3D hero renders (client brand assets, transparent PNG) for the
// original categories. An image uploaded on the Sanity category doc wins over
// this map, so new categories added in the Studio get their visual from there
// (transparent PNGs sit best on the lit stage). No image at all = text only.
const CAT_HERO: Record<string, string> = {
  "gunes-panelleri": "/images/products/panels.png",
  inverterler: "/images/products/inverters.png",
  "enerji-depolama": "/images/products/storage.png",
  "tasinabilir-guc": "/images/products/portable-power.png",
  "sarj-kontrol": "/images/products/charge-controllers.png",
  "solar-paket": "/images/products/packages.png",
  "solar-ekipman": "/images/products/equipment.png",
  "isi-pompasi": "/images/products/heat-pumps.png",
  "ev-sarj": "/images/products/ev-charging.png",
  "solar-aydinlatma": "/images/products/lighting.png",
};

// Shared catalog category grid. Each tile links to its category detail page.
export async function CategoryGrid({
  items,
}: {
  items: { cat: ProductCategoryItem; count: number }[];
}) {
  const t = await getTranslations("Products");

  return (
    <ul className={styles.catGrid}>
      {items.map(({ cat, count }) => {
        const hero = cat.image ? coverSrc(cat.image, 520) : CAT_HERO[cat.slug];
        const title = t.has(`categories.${cat.slug}`) ? t(`categories.${cat.slug}`) : cat.title;
        const desc = t.has(`catDesc.${cat.slug}`) ? t(`catDesc.${cat.slug}`) : "";
        return (
          <li key={cat._id}>
            <Link
              href={{ pathname: "/urunler/[category]", params: { category: cat.slug } }}
              className={styles.catCard}
            >
              {hero ? (
                <span className={styles.catStage} aria-hidden="true">
                  <Image
                    src={hero}
                    alt=""
                    width={520}
                    height={290}
                    sizes="(max-width: 560px) 62vw, 260px"
                    className={styles.catHeroImg}
                  />
                </span>
              ) : null}
              <span className={styles.catText}>
                <span className={styles.catCount}>{t("countLabel", { count })}</span>
                <span className={styles.catCardTitle}>{title}</span>
                {desc ? <span className={styles.catDesc}>{desc}</span> : null}
                <span className={styles.catFoot} aria-hidden="true">
                  <span className={styles.catRule} />
                  <span className={styles.catGo}>
                    <IconArrowRight size={16} />
                  </span>
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
