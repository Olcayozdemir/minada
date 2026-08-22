import Image from "next/image";
import clsx from "clsx";
import { ScrollTopLink } from "@/components/ui/ScrollTopLink";
import styles from "./Logo.module.scss";

// MİNADA markası: çift-M, orta kolda güneş, sağ kolda yapraklar.
// İki dosya var çünkü kontur açık zeminde lacivert ve koyu zeminde kayboluyordu.
// Koyu sürümde kontur beyaza dönüyor, boşluklar iki sürümde de açık kalıyor;
// harfin karakteri böyle korunuyor.
// tone="adaptive" header için: hero fotoğrafının üstünde koyu, sayfa kayıp pill
// açık zemine dönünce açık sürüm devreye giriyor (CSS, HeaderShell'in
// [data-scrolled] niteliği üzerinden).
// Ana sayfadayken tıklama navigasyon yerine sayfayı en üste alır.
export function Logo({
  withWordmark = true,
  onClick,
  tone = "light",
}: {
  withWordmark?: boolean;
  onClick?: () => void;
  tone?: "light" | "dark" | "adaptive";
}) {
  const mark = (variant: "light" | "dark") => (
    <Image
      src={variant === "dark" ? "/logo/logo1-on-dark.png" : "/logo/logo1.png"}
      alt=""
      width={69}
      height={40}
      className={clsx(styles.img, styles[variant])}
    />
  );

  return (
    <ScrollTopLink href="/" className={styles.logo} aria-label="MİNADA" onClick={onClick}>
      <span className={clsx(styles.chip, tone === "adaptive" && styles.adaptive)}>
        {tone === "adaptive" ? (
          <>
            {mark("light")}
            {mark("dark")}
          </>
        ) : (
          mark(tone)
        )}
      </span>
      {withWordmark && <span className={styles.word}>MİNADA</span>}
    </ScrollTopLink>
  );
}
