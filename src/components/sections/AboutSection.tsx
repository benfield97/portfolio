import { Section } from "./Section";

export function AboutSection() {
  return (
    <Section
      id="about"
      number="01"
      title="hey! i'm ben."
      subtitle="bio ⋅ resume ⋅ links"
    >
      <div className="space-y-6">
        <p className="text-lg text-foreground/90 leading-relaxed">
          I&apos;m figuring out what&apos;s next for me. Write a short bio about yourself here—what you&apos;re working on, what excites you, and where you&apos;re headed.
        </p>
        
        <p className="text-muted-foreground leading-relaxed">
          You can add more details about your background, current projects, or interests. Keep it conversational and authentic.
        </p>

        <div className="flex flex-wrap gap-4 pt-4">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 transition-colors group"
          >
            <span>bio</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </a>
          <span className="text-muted-foreground">⋅</span>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 transition-colors group"
          >
            <span>resume</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </a>
          <span className="text-muted-foreground">⋅</span>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 transition-colors group"
          >
            <span>links</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </Section>
  );
}

