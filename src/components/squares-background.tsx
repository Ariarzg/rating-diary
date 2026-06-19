"use client";

import { Squares } from "@/components/animations/squares";

export function SquaresBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Squares
        direction="diagonal"
        speed={0.15}
        squareSize={40}
        borderColor="currentColor"
        className="text-border opacity-30 dark:opacity-100"
      />
    </div>
  );
}
