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
    image: "https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=1600",
  },
  {
    id: 2,
    title: "Bubble Shooter",
    genre: "Arcade",
    description: "Sikt, match bobler og fjern brettet før skuddene tar over skjermen.",
    href: "/bubble-shooter",
    image: "https://images.unsplash.com/photo-1623211267242-f8f8b4ec0f98?w=1600",
  },
  {
    id: 3,
    title: "Neon Snake",
    genre: "Retro",
    description: "Klassisk Snake med lysende arena, raskere tempo og høy score-jakt.",
    href: "/snake",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600",
  },
  {
    id: 4,
    title: "Tetris With Effects",
    genre: "Classic",
    description: "Tetris med hold, ghost piece, sprint-mode og moderne visuelle effekter.",
    href: "/tetris",
    image: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=1600",
  },
  {
    id: 5,
    title: "Tux Racer",
    genre: "Racing",
    description: "Race ned snødekte bakker med pingvinen Tux på klassiske baner.",
    href: "/tux-racer/levels.html",
    image: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=1600",
  },
  {
    id: 6,
    title: "VAROOOM 3D",
    genre: "Racing",
    description: "Retro 3D-racing fra Game Boy Advance, kjørt direkte i nettleseren.",
    href: "/varooom-3d",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600",
  },
];

export function findGameById(gameId: string | undefined): HubGame | undefined {
  if (!gameId) {
    return undefined;
  }

  return HUB_GAMES.find((game) => String(game.id) === gameId);
}
