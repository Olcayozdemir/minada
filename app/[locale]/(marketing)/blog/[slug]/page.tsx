import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { getPost, getPostSlugs } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
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

  return (
    <Section tone="light">
      <article className={styles.article}>
        <Link href="/blog" className={styles.back}>
          ← {t("back")}
        </Link>
        {post.category?.title ? <span className={styles.cat}>{post.category.title}</span> : null}
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          {post.author?.name ? (
            <span>
              {t("by")} {post.author.name}
            </span>
          ) : null}
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString(locale)}
          </time>
        </div>
        {post.coverImage ? (
          <div className={styles.cover}>
            <Image
              src={urlFor(post.coverImage).width(1200).height(675).url()}
              alt={post.title}
              width={1200}
              height={675}
              priority
            />
          </div>
        ) : null}
        <PortableBody value={post.body} />
      </article>
    </Section>
  );
}
