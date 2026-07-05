import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { getPost, getPostSlugs, getPosts } from "@/sanity/queries";
import { coverSrc } from "@/sanity/image";
import { PortableBody } from "@/components/marketing/PortableBody";
import { SITE_URL } from "@/lib/seo";
import styles from "./article.module.scss";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug, locale);
  if (!post) return {};
  const url = `${SITE_URL}/${locale}/blog/${slug}`;
  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    alternates: { canonical: url },
    openGraph: { url, type: "article" },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const post = await getPost(slug, locale);
  if (!post) notFound();

  // Two other recent posts for the footer rail; skip the one being read.
  const more = (await getPosts(locale)).filter((p) => p.slug !== slug).slice(0, 2);

  const date = new Date(post.publishedAt).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Section tone="light">
      <article>
        <header className={styles.header}>
          <Link href="/blog" className={styles.back}>
            ← {t("back")}
          </Link>
          {post.category?.title ? <p className={styles.cat}>{post.category.title}</p> : null}
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.meta}>
            {post.author?.name ? <span className={styles.author}>{post.author.name}</span> : null}
            <time dateTime={post.publishedAt}>{date}</time>
            {post.readMinutes ? <span>{t("minRead", { min: post.readMinutes })}</span> : null}
          </div>
        </header>

        {post.coverImage ? (
          <div className={styles.cover}>
            <Image
              src={coverSrc(post.coverImage, 1600)}
              alt={post.title}
              width={1600}
              height={900}
              priority
              sizes="(max-width: 1040px) 94vw, 1000px"
            />
          </div>
        ) : null}

        <div className={styles.bodyWrap}>
          <PortableBody value={post.body} />
        </div>

        {more.length > 0 ? (
          <footer className={styles.moreWrap}>
            <hr className={styles.divider} />
            <h2 className={styles.moreHead}>{t("latest")}</h2>
            <div className={styles.more}>
              {more.map((p) => (
                <Link
                  key={p._id}
                  href={{ pathname: "/blog/[slug]", params: { slug: p.slug } }}
                  className={styles.moreCard}
                >
                  {p.coverImage ? (
                    <span className={styles.moreThumb}>
                      <Image
                        src={coverSrc(p.coverImage, 640, 400)}
                        alt=""
                        width={640}
                        height={400}
                        className={styles.moreImg}
                      />
                    </span>
                  ) : null}
                  <span className={styles.moreTitle}>{p.title}</span>
                </Link>
              ))}
            </div>
          </footer>
        ) : null}
      </article>
    </Section>
  );
}
