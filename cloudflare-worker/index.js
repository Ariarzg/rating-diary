export default {
  async fetch(request) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return new Response(JSON.stringify({ error: "Query required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    };

    try {
      const tokenRes = await fetch(
        `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
        { headers }
      );

      if (!tokenRes.ok) {
        return new Response(JSON.stringify({ items: [] }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const tokenText = await tokenRes.text();
      const vqdMatch = tokenText.match(/vqd=([^&"']+)/);

      if (!vqdMatch) {
        return new Response(JSON.stringify({ items: [] }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const vqd = vqdMatch[1];

      const imageRes = await fetch(
        `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,,,&p=1&s=0`,
        { headers }
      );

      if (!imageRes.ok) {
        return new Response(JSON.stringify({ items: [] }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const imageData = await imageRes.json();

      const items = (imageData.results || [])
        .slice(0, 10)
        .map((img) => ({
          url: img.image,
          thumbnail: img.thumbnail,
          alt: img.title || "",
        }));

      return new Response(JSON.stringify({ items }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ items: [], error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
