"use client";

import type { MouseEvent, ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";

// Zaten hedef sayfadayken (logo ya da "Anasayfa") tıklamayı navigasyon yerine
// en üste dönüşe çevirir — aynı URL'ye gidiş router'da no-op olduğu için sayfa
// olduğu yerde kalıyordu. Başka bir sayfadaysan normal Link gibi davranır.
export function ScrollTopLink({
  href,
  onClick,
  children,
  ...rest
}: {
  href: StaticPathname;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const pathname = usePathname();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.();
    // Yeni sekmede aç / indir gibi tarayıcı kısayollarına dokunma.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (pathname !== href) return;

    e.preventDefault();
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    const toTop = () => window.scrollTo({ top: 0, behavior });
    toTop();
    // Mobil çekmeceden tıklandığında ilk çağrı boşa gider: drawer açıkken body
    // scroll'u kilitli. Kapanma commit olduktan sonra bir kez daha dene.
    setTimeout(toTop, 0);
  }

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
