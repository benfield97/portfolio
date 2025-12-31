import { Section } from "./Section";

interface WritingPost {
  title: string;
  date: string;
  slug: string;
}

const posts: WritingPost[] = [
  {
    title: "your first article title here",
    date: "12.30.24",
    slug: "first-article",
  },
  {
    title: "another interesting topic",
    date: "12.15.24",
    slug: "second-article",
  },
  {
    title: "thoughts on building things",
    date: "11.28.24",
    slug: "third-article",
  },
];

export function WritingSection() {
  return (
    <Section
      id="writing"
      number="03"
      title="sometimes i share my writing here."
      subtitle="advice ⋅ reflections ⋅ notes"
    >
      <div className="space-y-6">
        {/* Featured Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/writing/${post.slug}`}
              className="group block"
            >
              <div className="flex items-baseline justify-between gap-4 py-3 border-b border-blue-100 hover:border-blue-300 transition-colors">
                <h3 className="text-foreground group-hover:text-blue-700 transition-colors">
                  {post.title}
                </h3>
                <span className="text-sm text-muted-foreground shrink-0">
                  {post.date}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* All Writing Link */}
        <div className="pt-4">
          <a
            href="/writing"
            className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 transition-colors group"
          >
            <span>all writing</span>
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

