"use client";

import { motion } from "framer-motion";

type GlowCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function GlowCard({ children, className = "" }: GlowCardProps) {
  return (
    <motion.div
      className={`relative group ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-card rounded-xl border border-border backdrop-blur-sm">
        {children}
      </div>
    </motion.div>
  );
}

type GradientTextProps = {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
};

export function GradientText({
  children,
  className = "",
  gradient = "from-amber-500 via-orange-500 to-red-500 dark:from-amber-400 dark:via-orange-400 dark:to-red-400",
}: GradientTextProps) {
  return (
    <span
      className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent leading-[1.1] pb-[0.15em] inline-block ${className}`}
    >
      {children}
    </span>
  );
}
