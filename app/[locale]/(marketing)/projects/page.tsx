import { redirect } from "@/i18n/navigation";

// "Referanslar" no longer has its own tab — reference projects live under About.
// Keep the old route working by redirecting it there.
export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/about", locale });
}
