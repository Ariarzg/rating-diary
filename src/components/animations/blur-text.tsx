"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type BlurTextProps = {
  text: string;
  delay?: number;
  animateBy?: "words" | "characters";
  direction?: "top" | "bottom";
  className?: string;
};

export function BlurText({
  text,
  delay = 0,
  animateBy = "words",
  direction = "bottom",
  className = "",
}: BlurTextProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const items = animateBy === "words" ? text.split(" ") : text.split("");

  const container = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: delay + i * 0.08,
        duration: 0.6,
        ease: "easeOut" as const,
      },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
    hidden: {
      opacity: 0,
      y: direction === "bottom" ? 20 : -20,
      filter: "blur(8px)",
    },
  };

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      <motion.div
        className="flex flex-wrap"
        initial="hidden"
        animate={hasAnimated ? "visible" : "hidden"}
        variants={container}
      >
        {items.map((item, i) => (
          <motion.span
            key={`${item}-${i}`}
            variants={child}
            className={animateBy === "words" ? "mr-[0.25em]" : ""}
          >
            {item}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
