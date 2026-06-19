import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const searchRes = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`,
      { next: { revalidate: 3600 } }
    );

    if (!searchRes.ok) {
      return NextResponse.json({ items: [] });
    }

    const searchData = await searchRes.json();
    const appItems = (searchData.items || []).filter(
      (item: { type: string }) => item.type === "app"
    ).slice(0, 8);

    const items = await Promise.all(
      appItems.map(async (item: { id: number; name: string }) => {
        const baseUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}`;
        const images = [
          `${baseUrl}/header.jpg`,
          `${baseUrl}/capsule_616x353.jpg`,
          `${baseUrl}/capsule_231x87.jpg`,
        ];

        try {
          const detailRes = await fetch(
            `https://store.steampowered.com/api/appdetails?appids=${item.id}&l=english`,
            { next: { revalidate: 86400 } }
          );

          if (detailRes.ok) {
            const detailData = await detailRes.json();
            const details = detailData[item.id]?.data;

            if (details) {
              if (details.header_image) images.unshift(details.header_image);
              if (details.background) images.push(details.background);

              return {
                id: item.id.toString(),
                name: details.name || item.name,
                image: images[0] || null,
                images: [...new Set(images)].filter(Boolean),
                creator: details.developers?.[0] || "",
                metadata: {
                  developer: details.developers?.[0] || "",
                  year: details.release_date?.date?.split(",")?.pop()?.trim() || "",
                  genre: details.genres?.map((g: { description: string }) => g.description).slice(0, 2).join(", ") || "",
                },
                description: details.short_description || "",
              };
            }
          }
        } catch {
          // Fall through to basic data
        }

        return {
          id: item.id.toString(),
          name: item.name,
          image: images[0] || null,
          images: [...new Set(images)].filter(Boolean),
          creator: "",
          metadata: {
            developer: "",
            year: "",
            genre: "",
          },
          description: "",
        };
      })
    );

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Steam search error:", error);
    return NextResponse.json({ items: [] });
  }
}
