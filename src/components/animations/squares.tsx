"use client";

import { useEffect, useRef } from "react";

type SquaresProps = {
  direction?: "diagonal" | "up" | "down" | "left" | "right";
  speed?: number;
  squareSize?: number;
  borderColor?: string;
  className?: string;
};

export function Squares({
  direction = "diagonal",
  speed = 0.3,
  squareSize = 40,
  borderColor = "rgba(255,255,255,0.05)",
  className = "",
}: SquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx?.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function draw() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / squareSize) + 1;
      const rows = Math.ceil(canvas.height / squareSize) + 1;

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;

      for (let i = -1; i < cols; i++) {
        for (let j = -1; j < rows; j++) {
          let x = i * squareSize;
          let y = j * squareSize;

          if (direction === "diagonal") {
            x += offset;
            y += offset;
          } else if (direction === "right") {
            x += offset;
          } else if (direction === "left") {
            x -= offset;
          } else if (direction === "down") {
            y += offset;
          } else if (direction === "up") {
            y -= offset;
          }

          ctx.strokeRect(x, y, squareSize, squareSize);
        }
      }

      offset += speed;

      if (offset >= squareSize) {
        offset = 0;
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [direction, speed, squareSize, borderColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: "none" }}
    />
  );
}
