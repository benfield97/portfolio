"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

const links = [
  { href: "/", label: "Home and contact", icon: "home" },
  { href: "/writing", label: "Writing", icon: "pencil" },
  { href: "/bookshelf", label: "Goodreads bookshelf", icon: "book" },
] as const;

const SELECT_SOUND = "/audio/nav-select-typewriter-hard.wav";

export function IconNavigation() {
  const pathname = usePathname();
  const selectAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const selectAudio = new Audio(SELECT_SOUND);
    selectAudio.preload = "auto";
    selectAudio.volume = 0.1;
    selectAudioRef.current = selectAudio;

    return () => {
      selectAudio.pause();
      selectAudioRef.current = null;
    };
  }, []);

  const playSound = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  return (
    <nav aria-label="Primary navigation" className="mt-3 flex flex-col gap-1">
      {links.map(({ href, label, icon }) => {
        const active =
          href === "/" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            onClick={() => playSound(selectAudioRef.current)}
            className="group flex size-12 items-center justify-start rounded-sm outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span
              aria-hidden="true"
              className={`block size-10 bg-contain bg-center bg-no-repeat [image-rendering:pixelated] transition-opacity ${active ? "opacity-100" : "opacity-45 group-hover:opacity-75"}`}
              style={{ backgroundImage: `url('/nav-icons/${icon}.png')` }}
            />
          </Link>
        );
      })}
    </nav>
  );
}
