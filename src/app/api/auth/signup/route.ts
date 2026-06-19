import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, setSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { displayName, email, password } = await request.json();

    if (!displayName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        displayName,
        email: email.toLowerCase(),
        passwordHash,
      })
      .returning();

    await setSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
