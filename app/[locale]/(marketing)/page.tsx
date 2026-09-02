import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EnergyLine } from "@/components/marketing/EnergyLine";
import { Hero } from "@/components/marketing/Hero";
import { Intro } from "@/components/marketing/Intro";
import { Services } from "@/components/marketing/Services";
import { StatsBand } from "@/components/marketing/StatsBand";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { ApplicationAreas } from "@/components/marketing/ApplicationAreas";
import { CalculatorTeaser } from "@/components/marketing/CalculatorTeaser";
import { Proof } from "@/components/marketing/Proof";
import { FaqTeaser } from "@/components/marketing/FaqTeaser";
import { FinalCta } from "@/components/marketing/FinalCta";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildAlternates, localBusinessLd, faqLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: { absolute: t("homeTitle") },
    description: t("description"),
    alternates: buildAlternates("/", locale),
  };
}

const FAQ_IDS = ["cost", "payback", "warranty", "incentives"] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tf = await getTranslations({ locale, namespace: "Home.faq" });
  const faqItems = FAQ_IDS.map((id) => ({ q: tf(`${id}.q`), a: tf(`${id}.a`) }));

  return (
    <>
      <JsonLd data={localBusinessLd(locale)} />
      <JsonLd data={faqLd(faqItems)} />
      <EnergyLine>
        <Hero />
        <Intro />
        <Services />
        {/* Özet ("Keşiften işletmeye 6 adım") — fotoğraflı tam anlatım /nasil-calisir'da.
            Notion'daki "Nasıl çalışır kaldırılacak" maddesi bu bölümü değil,
            menüdeki Nasıl Çalışır linkini kastediyor (Olcay, 2026-08-06). */}
        <HowItWorks />
        {/* Rakamlarla MİNADA — same band as the About page. */}
        <StatsBand />
        <ApplicationAreas />
        {/* Buraya bir "Bir gün" zaman çizelgesi denendi ve düştü (Olcay,
            2026-08-30). Üç ayrı görsel dil denendi (grafik · kâğıt kesme sahne
            · mimari kesit), üçü de tutmadı. Teşhis fikrin kendisinde: elle
            çizilen bir bölüm, sayfanın geri kalanını taşıyan fotoğrafik
            render'ların yanında zayıf kalıyor. Aynı fikri dördüncü kez
            denemeden önce bunu bil. */}
        <CalculatorTeaser />
        {/* Ürünler teaser'ı ana sayfadan kaldırıldı (Olcay, 2026-08-06);
            /urunler sayfası yaşıyor. */}
        {/* Sayfanın geri kalanı render; bu bölüm gerçek. Referans fotoğrafları
            /referanslar'daki Sanity kayıtlarından gelir, yorumlar Okan'ın
            2026-09-02'de Notion'a yazdığı dört müşteriden. Uydurma üç yorum
            2026-07-11'de kaldırılmıştı; bunlar isimli ve gerçek. */}
        <Proof locale={locale} />
        <FinalCta />
        <FaqTeaser />
      </EnergyLine>
    </>
  );
}
