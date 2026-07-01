import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed the `middleware` convention to `proxy` (Node runtime).
// next-intl's middleware handles locale detection, prefixing and redirects.
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API routes and anything with a file extension.
  matcher: "/((?!api|_next|_vercel|studio|.*\\..*).*)",
};
