export function MusicIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export function GameIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 12h4" />
      <path d="M8 10v4" />
      <circle cx="17" cy="10" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

export function MovieIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 8h20" />
      <path d="M8 4v4" />
      <path d="M16 4v4" />
      <path d="M2 12h20" />
      <path d="M2 16h20" />
    </svg>
  );
}

export function BookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6" />
      <path d="M8 11h4" />
    </svg>
  );
}

export function StarIcon({ filled = false, className = "w-4 h-4" }: { filled?: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  music: MusicIcon,
  game: GameIcon,
  movie: MovieIcon,
  book: BookIcon,
};

export function RatingStars({ value, max = 5, size = "sm" }: { value: number; max?: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <StarIcon key={i} filled={i < Math.round(value)} className={sizeClass} />
      ))}
    </div>
  );
}
