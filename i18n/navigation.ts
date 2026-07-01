import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation APIs. Always import Link / useRouter / usePathname
// from here (not from `next/link` or `next/navigation`) so locale prefixes and
// localized slugs are handled automatically.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
