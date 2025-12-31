import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  imagePlaceholder?: boolean;
  className?: string;
}

export function Section({
  id,
  number,
  title,
  subtitle,
  children,
  imagePlaceholder = true,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "min-h-screen flex items-center py-24 lg:py-0",
        className
      )}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Image Placeholder */}
          {imagePlaceholder && (
            <div className="order-2 lg:order-1">
              <div className="relative aspect-square max-w-md mx-auto lg:mx-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-white rounded-2xl border border-blue-200/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-blue-400/60">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                      stroke="currentColor"
                      className="w-16 h-16 mx-auto mb-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                    <p className="text-sm">image coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right: Content */}
          <div className={cn("order-1 lg:order-2", !imagePlaceholder && "lg:col-span-2")}>
            {/* Section Number & Title */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-blue-600 text-sm font-medium">{number}</span>
                <div className="h-px w-12 bg-blue-300" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                {title}
              </h2>
              {subtitle && (
                <p className="text-muted-foreground text-sm">{subtitle}</p>
              )}
            </div>

            {/* Section Content */}
            <div>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

