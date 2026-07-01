import { setRequestLocale, getTranslations } from "next-intl/server";
import { PlaceholderPage } from "@/components/marketing/PlaceholderPage";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Footer");
  return <PlaceholderPage title={t("privacy")} />;
}
