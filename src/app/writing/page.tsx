import type { Metadata } from "next";

import { WritingSection } from "@/components/sections/WritingSection";

export const metadata: Metadata = {
  title: "Writing · Ben Field",
};

export default function WritingPage() {
  return <WritingSection />;
}
