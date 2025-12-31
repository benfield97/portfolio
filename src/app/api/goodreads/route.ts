import { NextResponse } from "next/server";

const GOODREADS_USER_ID = "55876586";

interface GoodreadsBook {
  title: string;
  author: string;
  rating: number;
  dateRead: string | null;
  cover: string;
  link: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shelf = searchParams.get("shelf") || "read";
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const rssUrl = `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?shelf=${shelf}`;
    const response = await fetch(rssUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Goodreads RSS");
    }

    const xml = await response.text();
    const books = parseGoodreadsRSS(xml, limit);

    return NextResponse.json({ books, shelf });
  } catch (error) {
    console.error("Goodreads fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

function parseGoodreadsRSS(xml: string, limit: number): GoodreadsBook[] {
  const books: GoodreadsBook[] = [];
  
  // Simple XML parsing using regex (works for RSS structure)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let count = 0;

  while ((match = itemRegex.exec(xml)) !== null && count < limit) {
    const item = match[1];

    const title = extractTag(item, "title")?.replace(/ \(.*?\)$/, "") || ""; // Remove series info
    const author = extractTag(item, "author_name") || "";
    const ratingStr = extractTag(item, "user_rating");
    const rating = ratingStr ? parseInt(ratingStr) : 0;
    const dateRead = extractTag(item, "user_read_at") || null;
    const link = extractTag(item, "link") || "";
    
    // Extract book cover from description
    const description = extractTag(item, "description") || "";
    const coverMatch = description.match(/src="([^"]+)"/);
    let cover = coverMatch ? coverMatch[1] : "";
    
    // Get larger image by modifying URL
    if (cover) {
      cover = cover.replace(/\._\w+_\./, "._SX300_.");
    }

    if (title) {
      books.push({ title, author, rating, dateRead, cover, link });
      count++;
    }
  }

  return books;
}

function extractTag(xml: string, tag: string): string | null {
  // Try CDATA first
  const cdataRegex = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`);
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  // Try regular tag
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}


