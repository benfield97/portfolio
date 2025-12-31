import { Fish } from "@/components/Fish";
import { AboutSection } from "@/components/sections/AboutSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { WritingSection } from "@/components/sections/WritingSection";
import { BookshelfSection } from "@/components/sections/BookshelfSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <main className="relative">
      {/* Animated fish that follows cursor */}
      <Fish />

      {/* Header - Fixed name in corner */}
      <header className="fixed top-8 left-8 z-50">
        <a href="/" className="text-lg font-medium text-foreground hover:text-blue-700 transition-colors">
          Ben Field
        </a>
      </header>

      {/* Sections */}
      <AboutSection />
      
      {/* Separator */}
      <div className="container mx-auto px-6 lg:px-12 py-8">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      </div>
      
      <ProjectsSection />
      
      {/* Separator */}
      <div className="container mx-auto px-6 lg:px-12 py-8">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      </div>
      
      <WritingSection />
      
      {/* Separator */}
      <div className="container mx-auto px-6 lg:px-12 py-8">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      </div>
      
      <BookshelfSection />
      
      {/* Separator */}
      <div className="container mx-auto px-6 lg:px-12 py-8">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      </div>
      
      <ContactSection />

      {/* Footer */}
      <footer className="py-12 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Ben Field
        </p>
      </footer>
    </main>
  );
}
