export type SliderDefinition = {
  key: string;
  label: string;
  description: string;
};

export type CategorySliders = {
  [key: string]: SliderDefinition[];
};

export const categorySliders: CategorySliders = {
  music: [
    {
      key: "rhythm",
      label: "Rhythm",
      description: "How infectious and well-crafted the beat and tempo feel",
    },
    {
      key: "lyrics",
      label: "Lyrics",
      description: "Depth, meaning, and poetic quality of the words",
    },
    {
      key: "vocals",
      label: "Vocals",
      description: "Vocal range, emotion, and delivery quality",
    },
    {
      key: "production",
      label: "Production",
      description: "Sound mixing, mastering, and overall audio quality",
    },
    {
      key: "mood",
      label: "Mood",
      description:
        "How well it sets and maintains the intended emotional tone",
    },
    {
      key: "replayability",
      label: "Replayability",
      description: "How often you want to listen to it again",
    },
    {
      key: "originality",
      label: "Originality",
      description:
        "How unique and innovative it sounds compared to others",
    },
  ],
  game: [
    {
      key: "gameplay",
      label: "Gameplay",
      description: "Core mechanics, controls, and how fun it is to play",
    },
    {
      key: "story",
      label: "Story",
      description:
        "Narrative depth, plot twists, and storytelling quality",
    },
    {
      key: "graphics",
      label: "Graphics",
      description: "Visual fidelity, art style, and aesthetic appeal",
    },
    {
      key: "sound_design",
      label: "Sound Design",
      description: "Sound effects, ambient audio, and audio feedback",
    },
    {
      key: "replayability",
      label: "Replayability",
      description: "How much value you get from playing it again",
    },
    {
      key: "immersion",
      label: "Immersion",
      description: "How well it pulls you into its world",
    },
    {
      key: "polish",
      label: "Polish",
      description:
        "Bug-free experience, UI/UX quality, and attention to detail",
    },
  ],
  movie: [
    {
      key: "plot",
      label: "Plot",
      description: "Story structure, pacing, and narrative coherence",
    },
    {
      key: "acting",
      label: "Acting",
      description: "Performances, emotional range, and believability",
    },
    {
      key: "cinematography",
      label: "Cinematography",
      description: "Camera work, lighting, and visual composition",
    },
    {
      key: "soundtrack",
      label: "Soundtrack",
      description: "Music score, sound effects, and audio atmosphere",
    },
    {
      key: "rewatchability",
      label: "Rewatchability",
      description: "How much you enjoy watching it again",
    },
    {
      key: "dialogue",
      label: "Dialogue",
      description:
        "Writing quality, wit, and natural conversation flow",
    },
    {
      key: "direction",
      label: "Direction",
      description:
        "Overall vision, scene composition, and creative choices",
    },
  ],
  book: [
    {
      key: "plot",
      label: "Plot",
      description:
        "Story arc, pacing, and how engaging the narrative is",
    },
    {
      key: "writing_style",
      label: "Writing Style",
      description: "Prose quality, voice, and literary craftsmanship",
    },
    {
      key: "characters",
      label: "Characters",
      description: "Depth, development, and relatability of characters",
    },
    {
      key: "world_building",
      label: "World-building",
      description: "Setting richness, lore, and immersive detail",
    },
    {
      key: "re_readability",
      label: "Re-readability",
      description: "How much you gain from reading it again",
    },
    {
      key: "themes",
      label: "Themes",
      description:
        "Depth of ideas, messages, and intellectual stimulation",
    },
    {
      key: "pacing",
      label: "Pacing",
      description: "How well the story flows and maintains momentum",
    },
  ],
  series: [
    {
      key: "acting",
      label: "Acting",
      description: "Performances, emotional range, and believability",
    },
    {
      key: "story",
      label: "Story",
      description: "Narrative depth, plot twists, and storytelling quality",
    },
    {
      key: "pacing",
      label: "Pacing",
      description: "How well episodes flow and maintain momentum",
    },
    {
      key: "cinematography",
      label: "Cinematography",
      description: "Camera work, lighting, and visual composition",
    },
    {
      key: "rewatchability",
      label: "Rewatchability",
      description: "How much you enjoy watching it again",
    },
    {
      key: "character_development",
      label: "Character Development",
      description: "How characters grow and evolve across episodes",
    },
    {
      key: "world_building",
      label: "World-building",
      description: "Setting richness, lore, and immersive detail",
    },
  ],
};

export const categoryLabels: { [key: string]: string } = {
  music: "Music",
  game: "Game",
  movie: "Movie",
  book: "Book",
  series: "Series",
};

export const categoryCreatorLabels: { [key: string]: string } = {
  music: "Artist / Band",
  game: "Developer",
  movie: "Director",
  book: "Author",
  series: "Showrunner / Network",
};

export const categoryCreatorPlaceholders: { [key: string]: string } = {
  music: "e.g., Queen, Radiohead, Kendrick Lamar",
  game: "e.g., CD Projekt Red, Naughty Dog, Nintendo",
  movie: "e.g., Christopher Nolan, Denis Villeneuve",
  book: "e.g., Frank Herbert, Brandon Sanderson",
  series: "e.g., Vince Gilligan, Netflix",
};

export const categoryExtraFields: {
  [key: string]: { key: string; label: string; placeholder: string }[];
} = {
  music: [
    { key: "album", label: "Album", placeholder: "e.g., A Night at the Opera" },
    { key: "year", label: "Year", placeholder: "e.g., 1975" },
    { key: "genre", label: "Genre", placeholder: "e.g., Rock, Jazz, Hip-Hop" },
  ],
  game: [
    { key: "platform", label: "Platform", placeholder: "e.g., PC, PS5, Switch" },
    { key: "year", label: "Year", placeholder: "e.g., 2023" },
    { key: "genre", label: "Genre", placeholder: "e.g., RPG, FPS, Puzzle" },
  ],
  movie: [
    { key: "year", label: "Year", placeholder: "e.g., 2010" },
    { key: "genre", label: "Genre", placeholder: "e.g., Sci-Fi, Drama, Comedy" },
  ],
  book: [
    { key: "year", label: "Year", placeholder: "e.g., 1965" },
    { key: "genre", label: "Genre", placeholder: "e.g., Sci-Fi, Fantasy, Mystery" },
  ],
  series: [
    { key: "year", label: "Year", placeholder: "e.g., 2023" },
    { key: "genre", label: "Genre", placeholder: "e.g., Sci-Fi, Drama, Thriller" },
    { key: "network", label: "Network", placeholder: "e.g., Netflix, HBO, AMC" },
  ],
};
