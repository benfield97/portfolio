import { Section } from "./Section";

export function HomeSection() {
  return (
    <Section id="home" title="hey! i'm ben.">
      <div className="space-y-6">
        <p className="text-lg leading-relaxed text-foreground/90">
          I&apos;m figuring out what&apos;s next for me. Write a short bio about
          yourself here—what you&apos;re working on, what excites you, and where
          you&apos;re headed.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          You can add more details about your background, current projects, or
          interests. Keep it conversational and authentic.
        </p>

        <div className="space-y-4 border-t border-border pt-8">
          <p className="leading-relaxed text-foreground/90">
            I love meeting new people and promise to write back within a few
            days.
          </p>
          <a
            href="mailto:your@email.com"
            className="inline-block text-lg text-primary transition-opacity hover:opacity-70"
          >
            your@email.com
          </a>
          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
            <a href="#" className="transition-opacity hover:opacity-70">
              x
            </a>
            <a href="#" className="transition-opacity hover:opacity-70">
              github
            </a>
            <a href="#" className="transition-opacity hover:opacity-70">
              linkedin
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
