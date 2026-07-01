"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

// Client boundary: keeps `sanity` (and its `swr` dependency) out of the RSC
// server graph, where swr's react-server build has no default export.
export default function Studio() {
  return <NextStudio config={config} />;
}
