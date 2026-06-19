import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const searchRes = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=8`
    );

    if (!searchRes.ok) {
      return NextResponse.json({ items: [] });
    }

    const searchData = await searchRes.json();

    const items = await Promise.all(
      (searchData.data || []).map(async (track: { id: number; title: string; artist: { name: string }; album: { id: number; title: string; cover_medium: string; cover_big: string; cover_xl: string } }) => {
        const images = [
          track.album.cover_xl || track.album.cover_big,
          track.album.cover_medium,
        ].filter(Boolean);

        let year = "";
        let genre = "";

        try {
          const albumRes = await fetch(
            `https://api.deezer.com/album/${track.album.id}`
          );
          if (albumRes.ok) {
            const albumData = await albumRes.json();
            if (albumData.release_date) {
              year = albumData.release_date.split("-")[0] || "";
            }
            if (albumData.genres?.data?.[0]?.name) {
              genre = albumData.genres.data[0].name;
            }
          }
        } catch {
          // Continue with empty year/genre
        }

        return {
          id: track.id.toString(),
          name: track.title,
          creator: track.artist.name,
          image: images[0] || null,
          images: [...new Set(images)],
          metadata: {
            album: track.album.title,
            artist: track.artist.name,
            year,
            genre,
          },
        };
      })
    );

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Deezer search error:", error);
    return NextResponse.json({ items: [] });
  }
}
