import type { Metadata } from "next";

import { BookshelfSection } from "@/components/sections/BookshelfSection";

export const metadata: Metadata = {
  title: "Bookshelf · Ben Field",
};

export default function BookshelfPage() {
  return <BookshelfSection />;
}
