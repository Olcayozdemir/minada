import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import styles from "./PlaceholderPage.module.scss";

// Temporary page shell so navigation works before dedicated phases build out
// each route (calculator: Phase 3, contact: Phase 4, blog/projects/faq: Phase 5).
export async function PlaceholderPage({ title, intro }: { title: string; intro?: string }) {
  const tc = await getTranslations("Common");

  return (
    <Section tone="dark">
      <div className={styles.hero}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.intro}>{intro ?? tc("pageComingDesc")}</p>
        <div className={styles.actions}>
          <Button href="/contact">{tc("getQuote")}</Button>
          <Button href="/" variant="ghost">
            {tc("backHome")}
          </Button>
        </div>
      </div>
    </Section>
  );
}
