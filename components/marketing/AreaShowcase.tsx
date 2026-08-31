import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { BUSINESS_LINES } from "@/lib/site";
import { IconHome, IconBuilding, IconLeaf, IconLandmark } from "@/components/ui/icons";
import styles from "./AreaShowcase.module.scss";

/* The four settings, and which of the four business lines carry the weight in
   each.

   The renders are purpose-made for this page (area-*-iso), in the same
   isometric diorama language as the four business-line cards: one scene per
   setting, carrying exactly the equipment that setting actually gets, with the
   cyan run threading between the parts. The homepage tiles keep the
   photographs; this page shows the systems. */
const AREAS = [
  { id: "konut", Icon: IconHome, img: "/images/v2/area-konut-iso.jpg", lines: ["ges", "bess", "heatpump", "evcharge"] },
  { id: "ticari", Icon: IconBuilding, img: "/images/v2/area-ticari-iso.jpg", lines: ["ges", "bess", "evcharge"] },
  { id: "tarim", Icon: IconLeaf, img: "/images/v2/area-tarim-iso.jpg", lines: ["ges", "bess"] },
  { id: "kamu", Icon: IconLandmark, img: "/images/v2/area-kamu-iso.jpg", lines: ["ges", "bess", "evcharge"] },
] as const satisfies ReadonlyArray<{
  id: string;
  Icon: unknown;
  img: string;
  lines: ReadonlyArray<(typeof BUSINESS_LINES)[number]["id"]>;
}>;

const POINTS = ["p1", "p2", "p3"] as const;

export async function AreaShowcase() {
  const t = await getTranslations("Areas");
  const tn = await getTranslations("Nav");
  const href = (id: string) => BUSINESS_LINES.find((l) => l.id === id)!.href;

  return (
    <Section tone="light">
      <SectionHeading eyebrow={t("listEyebrow")} title={t("listTitle")} intro={t("listIntro")} />

      <ul className={styles.grid}>
        {AREAS.map(({ id, Icon, img, lines }) => (
          <li key={id} id={id} className={styles.card}>
            <div className={styles.media}>
              <Image
                src={img}
                alt=""
                fill
                sizes="(max-width: 900px) 92vw, (max-width: 1400px) 46vw, 645px"
                quality={90}
                className={styles.photo}
              />
              <span className={styles.badge} aria-hidden="true">
                <Icon size={20} />
              </span>
            </div>

            <div className={styles.body}>
              <h3 className={styles.title}>{t(`${id}.title`)}</h3>
              <p className={styles.desc}>{t(`${id}.desc`)}</p>

              <ul className={styles.points}>
                {POINTS.map((p) => (
                  <li key={p}>{t(`${id}.${p}`)}</li>
                ))}
              </ul>

              {/* The lines that carry this setting, as doors into their own
                  pages: the page is a routing table as much as a showcase. */}
              <div className={styles.lines}>
                <span className={styles.linesLabel}>{t("linesLabel")}</span>
                <div className={styles.chips}>
                  {lines.map((l) => (
                    <Link key={l} href={href(l)} className={styles.chip}>
                      {tn(`line_${l}`)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
