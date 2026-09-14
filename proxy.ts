import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renamed the `middleware` convention to `proxy` (Node runtime).
// next-intl's middleware handles locale detection, prefixing and redirects.
// The calculator has a physical Turkish alias. Avoid rewriting it back to
// /calculator, which this Next.js proxy runtime redirects to the public URL.
const calculatorPathnames = Object.fromEntries(
  Object.entries(routing.pathnames).filter(([pathname]) => pathname !== "/calculator"),
);
const handleLocale = createMiddleware(routing);
const handleCalculator = createMiddleware({ ...routing, pathnames: calculatorPathnames, alternateLinks: false });

export default function proxy(request: NextRequest) {
  const aliases: Record<string, string> = {
    "/tr/calculator": "/tr/hesaplayici",
    "/en/hesaplayici": "/en/calculator",
  };
  const destination = aliases[request.nextUrl.pathname];
  if (destination) {
    const url = request.nextUrl.clone();
    url.pathname = destination;
    return NextResponse.redirect(url);
  }
  return /\/(calculator|hesaplayici)\/?$/.test(request.nextUrl.pathname)
    ? handleCalculator(request)
    : handleLocale(request);
}

export const config = {
  // Skip Next internals, API routes and anything with a file extension.
  matcher: "/((?!api|_next|_vercel|studio|.*\\..*).*)",
};
