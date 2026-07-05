import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { getPosts, type PostListItem } from "@/sanity/queries";
import { coverSrc } from "@/sanity/image";
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

function postDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const posts = await getPosts(locale);
  const [featured, ...rest] = posts;
  const latest = rest.slice(0, 4);

  const meta = (p: PostListItem) => (
    <>
      <time dateTime={p.publishedAt}>{postDate(p.publishedAt, locale)}</time>
      {p.readMinutes ? <span>{t("minRead", { min: p.readMinutes })}</span> : null}
    </>
  );

  return (
    <Section tone="light">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      {posts.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{t("emptyTitle")}</p>
          <p className={styles.emptyDesc}>{t("emptyDesc")}</p>
        </div>
      ) : (
        <>
          {/* Featured (latest) post + compact latest list, magazine front page. */}
          <div className={styles.lead}>
            <Link
              href={{ pathname: "/blog/[slug]", params: { slug: featured.slug } }}
              className={styles.featured}
            >
              {featured.coverImage ? (
                <Image
                  src={coverSrc(featured.coverImage, 1400)}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 900px) 92vw, 60vw"
                  className={styles.featuredImg}
                />
              ) : null}
              <span className={styles.featuredScrim} aria-hidden="true" />
              <span className={styles.featuredPanel}>
                {featured.category?.title ? (
                  <span className={styles.chip}>{featured.category.title}</span>
                ) : null}
                <span className={styles.featuredTitle}>{featured.title}</span>
                <span className={styles.featuredMeta}>{meta(featured)}</span>
              </span>
            </Link>

            {latest.length > 0 ? (
              <aside className={styles.latest}>
                <h2 className={styles.latestHead}>{t("latest")}</h2>
                <ul className={styles.latestList}>
                  {latest.map((p) => (
                    <li key={p._id}>
                      <Link
                        href={{ pathname: "/blog/[slug]", params: { slug: p.slug } }}
                        className={styles.row}
                      >
                        {p.coverImage ? (
                          <span className={styles.thumb}>
                            <Image
                              src={coverSrc(p.coverImage, 180, 180)}
                              alt=""
                              width={90}
                              height={90}
                              className={styles.thumbImg}
                            />
                          </span>
                        ) : null}
                        <span className={styles.rowText}>
                          <span className={styles.rowTitle}>{p.title}</span>
                          <span className={styles.rowMeta}>{meta(p)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>

          {rest.length > 0 ? (
            <>
              <hr className={styles.divider} />
              <ul className={styles.grid}>
                {rest.map((p) => (
                  <li key={p._id}>
                    <Link
                      href={{ pathname: "/blog/[slug]", params: { slug: p.slug } }}
                      className={styles.card}
                    >
                      {p.coverImage ? (
                        <span className={styles.cover}>
                          <Image
                            src={coverSrc(p.coverImage, 720, 480)}
                            alt=""
                            width={720}
                            height={480}
                            sizes="(max-width: 560px) 92vw, (max-width: 900px) 46vw, 30vw"
                            className={styles.coverImg}
                          />
                        </span>
                      ) : null}
                      {p.category?.title ? (
                        <span className={styles.cat}>{p.category.title}</span>
                      ) : null}
                      <span className={styles.cardTitle}>{p.title}</span>
                      {p.excerpt ? <span className={styles.excerpt}>{p.excerpt}</span> : null}
                      <span className={styles.cardMeta}>{meta(p)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </Section>
  );
}
