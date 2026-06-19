import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
