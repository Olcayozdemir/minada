import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppWidget } from "@/components/layout/WhatsAppWidget";
import { RevealOnScroll } from "@/components/ui/Reveal";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Common");

  return (
    <>
      <a href="#main" className="skip-link">
        {t("skipToContent")}
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppWidget />
      <RevealOnScroll />
    </>
  );
}
