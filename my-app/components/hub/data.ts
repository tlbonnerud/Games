export interface HubGame {
  id: number;
  title: string;
  genre: string;
  description: string;
  href: string;
  image: string;
}

export const HUB_GAMES: HubGame[] = [
  {
    id: 1,
    title: "Chicken Farm Factory",
    genre: "Idle",
    description: "Bygg en pixel-farm med automatisering, upgrades og produksjonskjedeeffekt.",
    href: "/farm",
    image: "/hero-chicken.svg",
  },
  {
    id: 2,
    title: "Bubble Shooter",
    genre: "Arcade",
    description: "Sikt, match bobler og fjern brettet før skuddene tar over skjermen.",
    href: "/bubble-shooter",
    image: "/hero-bubble.svg",
  },
  {
    id: 3,
    title: "Neon Snake",
    genre: "Retro",
    description: "Klassisk Snake med lysende arena, raskere tempo og høy score-jakt.",
    href: "/snake",
    image: "/hero-snake.svg",
  },
  {
    id: 4,
    title: "Tetris With Effects",
    genre: "Classic",
    description: "Tetris med hold, ghost piece, sprint-mode og moderne visuelle effekter.",
    href: "/tetris",
    image: "/hero-tetris.svg",
  },
  {
    id: 5,
    title: "Tux Racer",
    genre: "Racing",
    description: "Race ned snødekte bakker med pingvinen Tux på klassiske baner.",
    href: "/tux-racer/levels.html",
    image: "/tux-racer/assets/splash.webp",
  },
];

export function findGameById(gameId: string | undefined): HubGame | undefined {
  if (!gameId) {
    return undefined;
  }

  return HUB_GAMES.find((game) => String(game.id) === gameId);
}
