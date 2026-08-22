import { IconInstagram } from "@/components/ui/icons";
import { SITE } from "@/lib/site";

// Instagram tek canlı sosyal hesabımız, o yüzden footer'da gömülü kalmak yerine
// header'da ve mobil menüde de duruyor. Kutu stilini çağıran yer veriyor;
// buradan gelen tek şey bağlantının kendisi ve erişilebilir adı.
export function InstagramLink({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <a
      href={SITE.social.instagram}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      className={className}
    >
      <IconInstagram size={size} />
    </a>
  );
}
