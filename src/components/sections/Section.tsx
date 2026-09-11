import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Section({
  id,
  title,
  children,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "min-h-screen flex items-center py-24 lg:py-0",
        className,
      )}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-3xl font-semibold text-foreground lg:text-4xl">
            {title}
          </h2>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}

