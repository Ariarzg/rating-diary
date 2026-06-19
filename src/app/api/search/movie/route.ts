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
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );

    if (!searchRes.ok) {
      return NextResponse.json({ items: [] });
    }

    const searchData = await searchRes.json();

    const items = await Promise.all(
      (searchData.results || []).slice(0, 8).map(async (movie: { id: number; title: string; release_date?: string; poster_path?: string; backdrop_path?: string; overview?: string }) => {
        const images = [
          movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
          movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        ].filter(Boolean);

        let director = "";
        let genre = "";

        try {
          const detailRes = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&append_to_response=credits`
          );
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData.credits?.crew) {
              const directorEntry = detailData.credits.crew.find(
                (person: { job: string }) => person.job === "Director"
              );
              director = directorEntry?.name || "";
            }
            if (detailData.genres?.[0]?.name) {
              genre = detailData.genres.slice(0, 2).map((g: { name: string }) => g.name).join(", ");
            }
          }
        } catch {
          // Continue with empty director/genre
        }

        return {
          id: movie.id.toString(),
          name: movie.title,
          image: images[0] || null,
          images,
          creator: director,
          metadata: {
            director,
            year: movie.release_date?.split("-")[0] || "",
            genre,
          },
          description: movie.overview?.slice(0, 300) || "",
        };
      })
    );

    return NextResponse.json({ items });
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json({ items: [] });
  }
}
