import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/signout-button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function ExperiencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/experiences"
              className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
            >
              Rating Diary
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
