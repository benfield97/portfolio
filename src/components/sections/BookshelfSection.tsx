"use client";

import { Section } from "./Section";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Book {
  title: string;
  author: string;
  rating: number;
  dateRead: string | null;
  cover: string;
  link: string;
}

export function BookshelfSection() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentlyReading, setCurrentlyReading] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const [readRes, readingRes] = await Promise.all([
          fetch("/api/goodreads?shelf=read&limit=8"),
          fetch("/api/goodreads?shelf=currently-reading&limit=4"),
        ]);

        if (readRes.ok) {
          const data = await readRes.json();
          setBooks(data.books || []);
        }

        if (readingRes.ok) {
          const data = await readingRes.json();
          setCurrentlyReading(data.books || []);
        }
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const BookCover = ({ book }: { book: Book }) => (
    <a
      href={book.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        {book.cover ? (
          <Image
            src={book.cover}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 25vw, 80px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-2">
            <span className="text-xs text-blue-600 text-center font-medium leading-tight">
              {book.title}
            </span>
          </div>
        )}
      </div>
      {/* Tooltip on hover */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        <div className="bg-foreground text-background text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap max-w-[200px] truncate">
          {book.title}
        </div>
      </div>
    </a>
  );

  const SkeletonCover = () => (
    <div className="aspect-[2/3] w-full rounded-md bg-blue-100 animate-pulse" />
  );

  return (
    <Section
      id="bookshelf"
      title="bookshelf"
    >
      <div className="space-y-8">
        {/* Currently Reading */}
        {(loading || currentlyReading.length > 0) && (
          <div>
            <span className="text-sm text-blue-600 font-medium mb-4 block">
              Currently reading
            </span>
            <div className="grid grid-cols-4 gap-3">
              {loading
                ? Array(4)
                    .fill(0)
                    .map((_, i) => <SkeletonCover key={i} />)
                : currentlyReading.map((book, index) => (
                    <BookCover key={index} book={book} />
                  ))}
            </div>
          </div>
        )}

        {/* Recently Read */}
        <div>
          <span className="text-sm text-blue-600 font-medium mb-4 block">
            Recently read
          </span>
          <div className="grid grid-cols-4 gap-3">
            {loading
              ? Array(8)
                  .fill(0)
                  .map((_, i) => <SkeletonCover key={i} />)
              : books.map((book, index) => (
                  <BookCover key={index} book={book} />
                ))}
          </div>
        </div>

        {/* Link to Goodreads */}
        <div className="pt-2">
          <a
            href="https://www.goodreads.com/user/show/55876586"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 transition-colors group"
          >
            <span>see all on goodreads</span>
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
