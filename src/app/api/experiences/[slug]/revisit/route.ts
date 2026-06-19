import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  experiences,
  revisits,
  revisitRatings,
  ratings as ratingsTable,
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const { notes, ratings: newRatings } = await request.json();

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

    const existingRevisits = await db.query.revisits.findMany({
      where: eq(revisits.experienceId, experience.id),
    });

    if (existingRevisits.length === 0 && newRatings && newRatings.length > 0) {
      const originalRatings = await db.query.ratings.findMany({
        where: eq(ratingsTable.experienceId, experience.id),
      });

      const [originalRevisit] = await db
        .insert(revisits)
        .values({
          experienceId: experience.id,
          notes: "Original ratings",
          isOriginal: true,
        })
        .returning();

      await db.insert(revisitRatings).values(
        originalRatings.map((r) => ({
          revisitId: originalRevisit.id,
          sliderKey: r.sliderKey,
          value: r.value,
        }))
      );
    }

    const [revisit] = await db
      .insert(revisits)
      .values({
        experienceId: experience.id,
        notes,
        isOriginal: false,
      })
      .returning();

    if (newRatings && newRatings.length > 0) {
      await db.insert(revisitRatings).values(
        newRatings.map((r: { key: string; value: number }) => ({
          revisitId: revisit.id,
          sliderKey: r.key,
          value: r.value,
        }))
      );

      for (const rating of newRatings) {
        await db
          .update(ratingsTable)
          .set({ value: rating.value })
          .where(
            and(
              eq(ratingsTable.experienceId, experience.id),
              eq(ratingsTable.sliderKey, rating.key)
            )
          );
      }

      const allRatings = await db.query.ratings.findMany({
        where: eq(ratingsTable.experienceId, experience.id),
      });

      const averageScore =
        allRatings.reduce((sum, r) => sum + r.value, 0) / allRatings.length;

      await db
        .update(experiences)
        .set({ averageScore, updatedAt: new Date() })
        .where(eq(experiences.id, experience.id));
    }

    return NextResponse.json(revisit);
  } catch (error) {
    console.error("Create revisit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
