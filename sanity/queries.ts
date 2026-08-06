/* eslint-disable @typescript-eslint/no-explicit-any */
import { groq } from "next-sanity";
import { client } from "./client";
import { hasSanity } from "./env";
import {
  CATEGORIES,
  GROUPS,
  type ProductCategoryItem,
  type ProductGroupItem,
} from "@/lib/catalog-data";
import { fallbackPost, fallbackPosts, fallbackSlugs } from "@/lib/blog-fallback";
import { readMinutes } from "@/lib/reading-time";

const postFields = groq`
  _id, title, "slug": slug.current, excerpt, coverImage, publishedAt,
  "category": category->{title},
  "bodyChars": length(pt::text(body))
`;

export type PostListItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: any;
  publishedAt: string;
  category?: { title: string };
  readMinutes?: number;
};

export type PostDetail = PostListItem & {
  body?: any;
  author?: { name: string; image?: any };
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: any };
};

export type ProjectItem = {
  _id: string;
  title: string;
  slug: string;
  location?: string;
  systemKw?: number;
  excerpt?: string;
  coverImage?: any;
};

function withReadMinutes<T extends { bodyChars?: number }>(post: T): T & { readMinutes: number } {
  const { bodyChars, ...rest } = post;
  return { ...rest, readMinutes: readMinutes(bodyChars) } as T & {
    readMinutes: number;
  };
}

export async function getPosts(locale: string): Promise<PostListItem[]> {
  if (!hasSanity) return fallbackPosts(locale);
  const posts = await client.fetch(
    groq`*[_type == "post" && language == $locale] | order(publishedAt desc){ ${postFields} }`,
    { locale },
    { next: { revalidate: 60 } },
  );
  return posts.map(withReadMinutes);
}

export async function getPostSlugs(): Promise<{ slug: string; language: string }[]> {
  if (!hasSanity) return fallbackSlugs();
  return client.fetch(
    groq`*[_type == "post" && defined(slug.current)]{ "slug": slug.current, language }`,
  );
}

export async function getPost(slug: string, locale: string): Promise<PostDetail | null> {
  if (!hasSanity) return fallbackPost(slug, locale);
  const post = await client.fetch(
    groq`*[_type == "post" && slug.current == $slug && language == $locale][0]{
      ${postFields}, body, "author": author->{name, image}, seo
    }`,
    { slug, locale },
    { next: { revalidate: 60 } },
  );
  return post ? withReadMinutes(post) : null;
}

// --- Catalog (Ürünler) ---------------------------------------------------
// Product docs are language-neutral: names/watts are shared; the UI localizes
// category titles, warranty labels and known feature keys. The item types and
// the static fallback dataset both live in lib/catalog-data.ts.
export type { ProductCategoryItem, ProductGroupItem };

export async function getProductCategories(): Promise<ProductCategoryItem[]> {
  if (!hasSanity) return CATEGORIES;
  return client.fetch(
    groq`*[_type == "productCategory"] | order(order asc, title asc){
      _id, title, "slug": slug.current, order, icon, image
    }`,
    {},
    { next: { revalidate: 60 } },
  );
}

export async function getProductGroups(): Promise<ProductGroupItem[]> {
  if (!hasSanity) return GROUPS;
  return client.fetch(
    groq`*[_type == "productGroup" && hidden != true] | order(order asc, title asc){
      _id, title, "slug": slug.current, powerRange, variants,
      warrantyProductYears, warrantyPerformanceYears, features, image, featured, order,
      "brand": brand->{title, "slug": slug.current, logo},
      "category": category->{_id, title, "slug": slug.current}
    }`,
    {},
    { next: { revalidate: 60 } },
  );
}

export async function getProjects(locale: string): Promise<ProjectItem[]> {
  if (!hasSanity) return [];
  return client.fetch(
    groq`*[_type == "projectReference" && language == $locale] | order(publishedAt desc){
      _id, title, "slug": slug.current, location, systemKw, excerpt, coverImage
    }`,
    { locale },
    { next: { revalidate: 60 } },
  );
}
