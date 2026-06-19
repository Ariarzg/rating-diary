"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MusicIcon, GameIcon, MovieIcon, BookIcon } from "@/lib/icons";
import { Squares } from "@/components/animations/squares";
import GradientText from "@/components/GradientText";
import { Particles } from "@/components/animations/particles";
import { GlowCard } from "@/components/animations/glow";
import { ThemeToggleWrapper } from "@/components/theme-toggle-wrapper";

const categories = [
  { name: "Music", Icon: MusicIcon, href: "/auth/signup", gradient: "from-purple-500 to-pink-500" },
  { name: "Games", Icon: GameIcon, href: "/auth/signup", gradient: "from-blue-500 to-cyan-500" },
  { name: "Movies", Icon: MovieIcon, href: "/auth/signup", gradient: "from-yellow-500 to-orange-500" },
  { name: "Books", Icon: BookIcon, href: "/auth/signup", gradient: "from-emerald-500 to-teal-500" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-hidden relative">
      <ThemeToggleWrapper />
      <Squares
        direction="diagonal"
        speed={0.2}
        squareSize={50}
        borderColor="currentColor"
        className="text-border opacity-30 dark:opacity-100"
      />
      <Particles count={30} className="opacity-40" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <GradientText
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
            colors={["#f59e0b", "#f97316", "#ef4444", "#f59e0b"]}
            animationSpeed={3}
            pauseOnHover
          >
            Rating Diary
          </GradientText>
        </motion.div>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground mb-12 max-w-lg mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Rate and journal your experiences across music, games, movies, and
          books
        </motion.p>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
            >
              <GlowCard>
                <div className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                    <category.Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {category.name}
                  </span>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <Link
            href="/auth/signup"
            className="group relative px-8 py-3.5 rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 text-white font-semibold">
              Get Started
            </span>
          </Link>
          <Link
            href="/auth/signin"
            className="px-8 py-3.5 rounded-xl border border-border text-foreground hover:bg-accent font-semibold transition-all duration-300"
          >
            Sign In
          </Link>
        </motion.div>
      </div>

      <motion.footer
        className="absolute bottom-6 left-0 right-0 text-center text-muted-foreground text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        <p>Built with Next.js, Drizzle, and Neon</p>
      </motion.footer>
    </div>
  );
}
