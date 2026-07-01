import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { getPosts } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildAlternates } from "@/lib/seo";
import styles from "./blog.module.scss";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Nav" });
  return { title: t("blog"), alternates: buildAlternates("/blog", locale) };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const posts = await getPosts(locale);

  return (
    <Section tone="light">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      {posts.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{t("emptyTitle")}</p>
          <p className={styles.emptyDesc}>{t("emptyDesc")}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {posts.map((p) => (
            <Link
              key={p._id}
              href={{ pathname: "/blog/[slug]", params: { slug: p.slug } }}
              className={styles.card}
            >
              {p.coverImage ? (
                <span className={styles.cover}>
                  <Image
                    src={urlFor(p.coverImage).width(600).height(360).url()}
                    alt={p.title}
                    width={600}
                    height={360}
                    className={styles.coverImg}
                  />
                </span>
              ) : null}
              <span className={styles.cardBody}>
                {p.category?.title ? <span className={styles.cat}>{p.category.title}</span> : null}
                <span className={styles.cardTitle}>{p.title}</span>
                {p.excerpt ? <span className={styles.excerpt}>{p.excerpt}</span> : null}
                <time className={styles.date} dateTime={p.publishedAt}>
                  {new Date(p.publishedAt).toLocaleDateString(locale)}
                </time>
              </span>
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}
