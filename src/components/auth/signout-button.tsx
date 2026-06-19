"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        Sign Out
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-orange-500/10 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400">
            <LogOutIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Sign Out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to sign out? You will need to sign in again to access your experiences.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSignOut}
            disabled={loading}
            className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 dark:bg-orange-500/15 dark:text-orange-400 dark:hover:bg-orange-500/25 font-semibold"
          >
            {loading ? "Signing out..." : "Sign Out"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
