import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppWidget } from "@/components/layout/WhatsAppWidget";
import { RevealOnScroll } from "@/components/ui/Reveal";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { CookieConsent } from "@/components/consent/CookieConsent";

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
    // The provider wraps the footer too: the "cookie preferences" link there is
    // how a recorded choice gets withdrawn, so it needs the same context.
    <ConsentProvider>
      <a href="#main" className="skip-link">
        {t("skipToContent")}
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppWidget />
      <RevealOnScroll />
      <CookieConsent />
    </ConsentProvider>
  );
}
