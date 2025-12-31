"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "about", label: "about me", number: "01" },
  { id: "projects", label: "projects", number: "02" },
  { id: "writing", label: "writing", number: "03" },
  { id: "bookshelf", label: "bookshelf", number: "04" },
  { id: "contact", label: "contact", number: "05" },
];

export function Navigation() {
  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <ul className="flex flex-col gap-4">
        {sections.map(({ id, label }) => (
          <li key={id}>
            <button
              onClick={() => scrollToSection(id)}
              className={cn(
                "group flex items-center gap-3 text-sm transition-all duration-300",
                activeSection === id
                  ? "text-blue-700"
                  : "text-muted-foreground hover:text-blue-600"
              )}
            >
              <span
                className={cn(
                  "h-px transition-all duration-300",
                  activeSection === id
                    ? "w-8 bg-blue-700"
                    : "w-4 bg-muted-foreground group-hover:w-6 group-hover:bg-blue-600"
                )}
              />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

