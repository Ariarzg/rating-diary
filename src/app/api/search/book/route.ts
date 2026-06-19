import { NextResponse } from "next/server";

async function searchGoogleBooks(query: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8&printType=books&orderBy=relevance`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    if (data.error) return [];

    return (data.items || []).map((book: { id: string; volumeInfo: { title: string; authors?: string[]; publishedDate?: string; imageLinks?: { thumbnail?: string; smallThumbnail?: string }; description?: string; categories?: string[]; pageCount?: number } }) => {
      const images = [
        book.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://").replace("edge=", "edgedel="),
        book.volumeInfo.imageLinks?.smallThumbnail?.replace("http://", "https://").replace("edge=", "edgedel="),
      ].filter(Boolean);

      return {
        id: book.id,
        name: book.volumeInfo.title,
        creator: book.volumeInfo.authors?.[0] || "",
        image: images[0] || null,
        images,
        metadata: {
          author: book.volumeInfo.authors?.join(", ") || "",
          year: book.volumeInfo.publishedDate?.split("-")[0] || "",
          genre: book.volumeInfo.categories?.[0] || "",
          pages: book.volumeInfo.pageCount?.toString() || "",
        },
        description: book.volumeInfo.description || "",
      };
    });
  } catch {
    return [];
  }
}

async function searchOpenLibrary(query: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8&fields=title,author_name,first_publish_year,cover_i,subject,key`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();

    return (data.docs || []).map((book: { key: string; title: string; author_name?: string[]; first_publish_year?: number; cover_i?: number; subject?: string[] }) => {
      const coverUrl = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
        : null;
      const thumbUrl = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null;

      return {
        id: book.key || book.title,
        name: book.title,
        creator: book.author_name?.[0] || "",
        image: coverUrl || null,
        images: [coverUrl, thumbUrl].filter(Boolean),
        metadata: {
          author: book.author_name?.[0] || "",
          year: book.first_publish_year?.toString() || "",
          genre: book.subject?.slice(0, 2).join(", ") || "",
          pages: "",
        },
        description: "",
      };
    });
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    let items = await searchGoogleBooks(query);

    if (items.length === 0) {
      items = await searchOpenLibrary(query);
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Book search error:", error);
    return NextResponse.json({ items: [] });
  }
}
