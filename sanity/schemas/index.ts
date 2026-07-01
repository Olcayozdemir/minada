import type { SchemaTypeDefinition } from "sanity";
import { blockContent } from "./blockContent";
import { category } from "./category";
import { author } from "./author";
import { post } from "./post";
import { projectReference } from "./projectReference";
import { service } from "./service";
import { faq } from "./faq";
import { testimonial } from "./testimonial";
import { siteSettings } from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  post,
  projectReference,
  category,
  author,
  service,
  faq,
  testimonial,
  siteSettings,
  blockContent,
];
