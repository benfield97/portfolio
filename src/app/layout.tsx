import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import { DolphinExperience } from "@/components/DolphinExperience";
import { IconNavigation } from "@/components/IconNavigation";

import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ben Field",
  description: "Personal portfolio of Ben Field",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        <DolphinExperience />
        <header className="fixed left-8 top-8 z-[110]">
          <Link
            href="/"
            aria-label="Ben Field"
            className="block h-[31px] w-[125px] rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Image
              src="/name/ben-field-even.png"
              alt=""
              width={125}
              height={31}
              priority
              unoptimized
              className="[image-rendering:pixelated]"
            />
          </Link>
          <IconNavigation />
        </header>
        <main className="pl-16 pt-40 sm:pl-0 sm:pt-0">{children}</main>
        <footer className="fixed bottom-4 right-5 z-[60] hidden text-xs text-muted-foreground sm:block">
          © 2025 Ben Field
        </footer>
      </body>
    </html>
  );
}
