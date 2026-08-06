import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { getPost, getPostSlugs, getPosts } from "@/sanity/queries";
import { coverSrc } from "@/sanity/image";
import { PortableBody } from "@/components/marketing/PortableBody";
import { JsonLd } from "@/components/ui/JsonLd";
import { SITE_URL, articleAlternates, articleLd, breadcrumbLd } from "@/lib/seo";
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
  const description = post.seo?.metaDescription || post.excerpt;
  // Absolute OG image: the article's own cover beats the site-wide default.
  const ogImage = post.coverImage ? coverSrc(post.coverImage, 1200, 630) : undefined;
  return {
    title: post.seo?.metaTitle || post.title,
    description,
    keywords: post.seo?.keywords,
    alternates: articleAlternates(locale, slug, post.altSlug),
    openGraph: {
      url,
      type: "article",
      title: post.seo?.metaTitle || post.title,
      description,
      publishedTime: post.publishedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo?.metaTitle || post.title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
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
      <JsonLd
        data={articleLd({
          locale,
          slug,
          title: post.title,
          description: post.seo?.metaDescription || post.excerpt,
          image: post.coverImage ? coverSrc(post.coverImage, 1200, 630) : undefined,
          publishedAt: post.publishedAt,
          authorName: post.author?.name,
          keywords: post.seo?.keywords,
        })}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "MİNADA", url: `${SITE_URL}/${locale}` },
          { name: t("eyebrow"), url: `${SITE_URL}/${locale}/blog` },
          { name: post.title, url: `${SITE_URL}/${locale}/blog/${slug}` },
        ])}
      />
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
