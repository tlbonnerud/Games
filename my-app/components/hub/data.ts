export interface HubGame {
  id: number;
  title: string;
  genre: string;
  description: string;
  href: string;
  image: string;
  /** game_id used in game_progress table – undefined for games that don't report scores */
  gameKey?: string;
}

export const HUB_GAMES: HubGame[] = [
  {
    id: 1,
    title: "Chicken Farm Factory",
    genre: "Idle",
    description: "Bygg en pixel-farm med automatisering, upgrades og produksjonskjedeeffekt.",
    href: "/farm",
    image: "/hero-chicken.svg",
    gameKey: "chicken-farm",
  },
  {
    id: 2,
    title: "Bubble Shooter",
    genre: "Arcade",
    description: "Sikt, match bobler og fjern brettet før skuddene tar over skjermen.",
    href: "/bubble-shooter",
    image: "/hero-bubble.svg",
    gameKey: "bubble-shooter",
  },
  {
    id: 3,
    title: "Neon Snake",
    genre: "Retro",
    description: "Klassisk Snake med lysende arena, raskere tempo og høy score-jakt.",
    href: "/snake",
    image: "/hero-snake.svg",
    gameKey: "neon-snake",
  },
  {
    id: 4,
    title: "Tetris With Effects",
    genre: "Classic",
    description: "Tetris med hold, ghost piece, sprint-mode og moderne visuelle effekter.",
    href: "/tetris",
    image: "/hero-tetris.svg",
    gameKey: "tetris",
  },
  {
    id: 5,
    title: "Tux Racer",
    genre: "Racing",
    description: "Race ned snødekte bakker med pingvinen Tux på klassiske baner.",
    href: "/tux-racer/levels.html",
    image: "/tux-racer/assets/splash.webp",
  },
  {
    id: 6,
    title: "VAROOOM 3D",
    genre: "Racing",
    description: "Retro 3D-racing fra Game Boy Advance, kjørt direkte i nettleseren.",
    href: "/varooom-3d",
    image: "/hero-varooom.svg",
  },
  {
    id: 7,
    title: "Freaky Towers",
    genre: "Puzzle",
    description: "Stable fargerike blokker i ustabile tårn – fysikkbasert pusle-spill inspirert av Tricky Towers.",
    href: "/freaky-towers",
    image: "/hero-freaky-towers.svg",
  },
];

export function findGameById(gameId: string | undefined): HubGame | undefined {
  if (!gameId) {
    return undefined;
  }

  return HUB_GAMES.find((game) => String(game.id) === gameId);
}
