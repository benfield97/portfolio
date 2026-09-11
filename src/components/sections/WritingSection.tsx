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
      title="sometimes i share my writing here."
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

      </div>
    </Section>
  );
}

