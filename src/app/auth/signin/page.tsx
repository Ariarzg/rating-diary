import { Suspense } from "react";
import { SignInForm } from "@/components/auth/signin-form";
import { ThemeToggleWrapper } from "@/components/theme-toggle-wrapper";
import { SquaresBackground } from "@/components/squares-background";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <SquaresBackground />
      <ThemeToggleWrapper />
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="w-full max-w-md mx-auto h-96 bg-muted rounded-lg animate-pulse" />
          }
        >
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
