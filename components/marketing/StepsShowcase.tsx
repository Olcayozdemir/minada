import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import styles from "./StepsShowcase.module.scss";

// Fotoğraflı 6 adım vitrini — segment sayfalarının süreç bölümü. Başlıklar
// sayfadan gelir (Segments.*), adım içeriği Home.how'dan okunur; tam anlatım
// /how-it-works'te.
const STEPS = [
  { id: "discovery", img: "/images/v2/how/discovery.jpg" },
  { id: "engineering", img: "/images/v2/how/engineering.jpg" },
  { id: "licensing", img: "/images/v2/how/licensing.jpg" },
  { id: "procurement", img: "/images/v2/how/procurement.jpg" },
  { id: "install", img: "/images/v2/how/install.jpg" },
  { id: "om", img: "/images/v2/how/om.jpg" },
] as const;

export async function StepsShowcase({
  eyebrow,
  title,
  intro,
  cta,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  cta: string;
}) {
  const th = await getTranslations("Home.how");

  return (
    <Section tone="sand">
      <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
      <ol className={styles.grid}>
        {STEPS.map(({ id, img }, i) => (
          <li key={id} className={styles.card}>
            <span className={styles.media} aria-hidden="true">
              <Image
                src={img}
                alt=""
                width={520}
                height={300}
                sizes="(max-width: 700px) 90vw, 340px"
                className={styles.img}
              />
              <span className={styles.num}>{`0${i + 1}`}</span>
            </span>
            <span className={styles.body}>
              <h3 className={styles.title}>{th(`${id}.title`)}</h3>
              <p className={styles.desc}>{th(`${id}.desc`)}</p>
            </span>
          </li>
        ))}
      </ol>
      <div className={styles.foot}>
        <Button href="/how-it-works" variant="secondary" withArrow>
          {cta}
        </Button>
      </div>
    </Section>
  );
}
