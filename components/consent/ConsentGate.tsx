"use client";

import type { ReactNode } from "react";
import { useConsent } from "./ConsentProvider";
import type { ConsentCategory } from "@/lib/consent";

/**
 * Renders its children only once the visitor has allowed that category.
 *
 * This is the part that makes the banner mean something. A tag that is not
 * wrapped in a gate is not governed by the banner no matter what the banner
 * says, so anything optional belongs in here:
 *
 *   <ConsentGate category="analytics">
 *     <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
 *   </ConsentGate>
 *
 * Withdrawal unmounts the children, which stops future calls but cannot undo
 * a script that already installed itself on window. For vendors that survive
 * unmount, a page load after refusal is the only honest reset, so send the
 * visitor's withdrawal through a reload rather than trusting the unmount.
 */
export function ConsentGate({
  category,
  children,
}: {
  category: ConsentCategory;
  children: ReactNode;
}) {
  const { consent, ready } = useConsent();
  if (!ready || !consent[category]) return null;
  return <>{children}</>;
}
