import { NextResponse } from "next/server";

// Cloudflare Worker URL that proxies DuckDuckGo image search.
// This bypasses DuckDuckGo's IP blocking on serverless platforms like Vercel.
// Set IMAGE_SEARCH_PROXY_URL in your .env file.
const WORKER_URL =
  process.env.IMAGE_SEARCH_PROXY_URL ||
  "https://image-search-proxy.ariarzg.workers.dev";

/**
 * GET /api/search/images/duckduckgo?q=<query>
 *
 * Proxies image search requests through a Cloudflare Worker.
 * The Worker fetches from DuckDuckGo and returns normalized results.
 *
 * Returns: { items: { url: string; thumbnail: string; alt: string }[] }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    // Call the Cloudflare Worker with the search query
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(
      `${WORKER_URL}/?q=${encodeURIComponent(query)}`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ items: [] });
    }

    const data = await res.json();

    return NextResponse.json({ items: data.items || [] });
  } catch (error) {
    console.error("Image search proxy error:", error);
    return NextResponse.json({ items: [] });
  }
}
