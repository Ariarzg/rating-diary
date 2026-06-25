import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const apiKey = process.env.TMDB_API_KEY;

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ items: [] });
    }

    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );

    if (!searchRes.ok) {
      return NextResponse.json({ items: [] });
    }

    const searchData = await searchRes.json();

    const items = await Promise.all(
      (searchData.results || []).slice(0, 8).map(async (show: { id: number; name: string; first_air_date?: string; poster_path?: string; backdrop_path?: string; overview?: string }) => {
        const images = [
          show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : null,
          show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        ].filter(Boolean);

        let network = "";
        let genre = "";

        try {
          const detailRes = await fetch(
            `https://api.themoviedb.org/3/tv/${show.id}?api_key=${apiKey}`
          );
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData.networks?.[0]?.name) {
              network = detailData.networks[0].name;
            }
            if (detailData.genres?.[0]?.name) {
              genre = detailData.genres.slice(0, 2).map((g: { name: string }) => g.name).join(", ");
            }
          }
        } catch {
          // Continue with empty network/genre
        }

        return {
          id: show.id.toString(),
          name: show.name,
          image: images[0] || null,
          images,
          creator: network,
          metadata: {
            network,
            year: show.first_air_date?.split("-")[0] || "",
            genre,
          },
          description: show.overview?.slice(0, 300) || "",
        };
      })
    );

    return NextResponse.json({ items });
  } catch (error) {
    console.error("TMDB TV search error:", error);
    return NextResponse.json({ items: [] });
  }
}
