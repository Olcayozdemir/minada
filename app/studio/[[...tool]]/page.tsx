import type { Viewport } from "next";
import Studio from "./Studio";

export const dynamic = "force-static";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function StudioPage() {
  return <Studio />;
}
