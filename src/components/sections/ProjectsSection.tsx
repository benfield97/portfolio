import { Section } from "./Section";

interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

const projects: Project[] = [
  {
    title: "Project One",
    description: "A brief description of what this project does and the problem it solves.",
    tags: ["React", "TypeScript", "Tailwind"],
    link: "#",
  },
  {
    title: "Project Two",
    description: "Another cool project you've built. Keep it concise but informative.",
    tags: ["Next.js", "Node.js"],
    link: "#",
  },
  {
    title: "Project Three",
    description: "Something else you're proud of. Show off your range.",
    tags: ["Python", "ML"],
    link: "#",
  },
];

export function ProjectsSection() {
  return (
    <Section
      id="projects"
      number="02"
      title="things i've built"
      subtitle="projects ⋅ experiments ⋅ open source"
    >
      <div className="space-y-6">
        {/* Projects List */}
        <div className="space-y-4">
          {projects.map((project, index) => (
            <a
              key={index}
              href={project.link}
              className="group block"
            >
              <div className="py-4 border-b border-blue-100 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-foreground group-hover:text-blue-700 transition-colors font-medium">
                    {project.title}
                  </h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 shrink-0 mt-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View All Link */}
        <div className="pt-4">
          <a
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 transition-colors group"
          >
            <span>view all projects</span>
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
