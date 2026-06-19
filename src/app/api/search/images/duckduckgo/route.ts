import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    };

    const tokenRes = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
      { headers }
    );

    if (!tokenRes.ok) {
      return NextResponse.json({ items: [] });
    }

    const tokenText = await tokenRes.text();
    const vqdMatch = tokenText.match(/vqd=([^&"']+)/);

    if (!vqdMatch) {
      return NextResponse.json({ items: [] });
    }

    const vqd = vqdMatch[1];

    const imageRes = await fetch(
      `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,,,&p=1&s=0`,
      { headers }
    );

    if (!imageRes.ok) {
      return NextResponse.json({ items: [] });
    }

    const imageData = await imageRes.json();

    const items = (imageData.results || []).slice(0, 10).map((img: { image: string; thumbnail: string; title: string }) => ({
      url: img.image,
      thumbnail: img.thumbnail,
      alt: img.title || "",
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("DuckDuckGo search error:", error);
    return NextResponse.json({ items: [] });
  }
}
