import { NextResponse } from "next/server";
import { db } from "@/db";
import { experiences, ratings } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userExperiences = await db.query.experiences.findMany({
      where: eq(experiences.userId, session.userId),
      orderBy: [desc(experiences.createdAt)],
    });

    return NextResponse.json(userExperiences);
  } catch (error) {
    console.error("Fetch experiences error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, name, creator, description, coverImage, metadata, ratings: ratingsData } = await request.json();

    if (!category || !name || !ratingsData || ratingsData.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validCategories = ["music", "game", "movie", "book", "series"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    const hasInvalidRating = ratingsData.some(
      (r: { value: number }) => !Number.isInteger(r.value) || r.value < 1 || r.value > 5
    );
    if (hasInvalidRating) {
      return NextResponse.json(
        { error: "Rating values must be between 1 and 5" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const averageScore =
      ratingsData.reduce((sum: number, r: { value: number }) => sum + r.value, 0) /
      ratingsData.length;

    const [experience] = await db
      .insert(experiences)
      .values({
        userId: session.userId,
        category,
        name,
        creator: creator || null,
        slug: `${slug}-${uuidv4().slice(0, 8)}`,
        description,
        coverImage: coverImage || null,
        metadata: metadata || {},
        averageScore,
      })
      .returning();

    await db.insert(ratings).values(
      ratingsData.map((r: { key: string; label: string; description: string; value: number }) => ({
        experienceId: experience.id,
        sliderKey: r.key,
        sliderLabel: r.label,
        sliderDescription: r.description,
        value: r.value,
      }))
    );

    return NextResponse.json(experience);
  } catch (error) {
    console.error("Create experience error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
