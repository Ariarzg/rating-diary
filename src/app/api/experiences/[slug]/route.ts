import { NextResponse } from "next/server";
import { db } from "@/db";
import { experiences, ratings, revisits } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { unlink } from "fs/promises";
import { join } from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const experience = await db.query.experiences.findFirst({
      where: and(
        eq(experiences.slug, slug),
        eq(experiences.userId, session.userId)
      ),
    });

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    const experienceRatings = await db.query.ratings.findMany({
      where: eq(ratings.experienceId, experience.id),
    });

    const experienceRevisits = await db.query.revisits.findMany({
      where: eq(revisits.experienceId, experience.id),
      orderBy: [desc(revisits.createdAt)],
      with: { ratings: true },
    });

    return NextResponse.json({
      experience,
      ratings: experienceRatings,
      revisits: experienceRevisits,
    });
  } catch (error) {
    console.error("Fetch experience error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const experience = await db.query.experiences.findFirst({
      where: and(
        eq(experiences.slug, slug),
        eq(experiences.userId, session.userId)
      ),
    });

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    if (experience.coverImage && experience.coverImage.startsWith("/uploads/")) {
      try {
        const filePath = join(process.cwd(), "public", experience.coverImage);
        await unlink(filePath);
      } catch {
        // File might not exist, continue with deletion
      }
    }

    await db.delete(experiences).where(eq(experiences.id, experience.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete experience error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const { coverImage, description, name, creator, metadata } = await request.json();

    const experience = await db.query.experiences.findFirst({
      where: and(
        eq(experiences.slug, slug),
        eq(experiences.userId, session.userId)
      ),
    });

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    if (coverImage !== undefined && experience.coverImage && experience.coverImage.startsWith("/uploads/") && coverImage !== experience.coverImage) {
      try {
        const filePath = join(process.cwd(), "public", experience.coverImage);
        await unlink(filePath);
      } catch {
        // File might not exist
      }
    }

    await db
      .update(experiences)
      .set({
        name: name !== undefined ? name : experience.name,
        creator: creator !== undefined ? creator : experience.creator,
        coverImage: coverImage !== undefined ? coverImage : experience.coverImage,
        description: description !== undefined ? description : experience.description,
        metadata: metadata !== undefined ? metadata : experience.metadata,
        updatedAt: new Date(),
      })
      .where(eq(experiences.id, experience.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update experience error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
