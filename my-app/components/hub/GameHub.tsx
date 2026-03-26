import Link from "next/link";

const GAMES = [
  {
    href: "/farm",
    title: "Chicken Farm Factory",
    description: "Incremental / idle farm med produksjon, upgrades og automatisering.",
    badge: "Idle",
    previewClass: "preview-farm",
  },
  {
    href: "/bubble-shooter",
    title: "Bubble Shooter",
    description: "Klassisk bubble shooter med sikting, kollisjon, match-3 og score.",
    badge: "Arcade",
    previewClass: "preview-bubble",
  },
  {
    href: "/snake",
    title: "Neon Snake",
    description: "Snake med glødende animasjoner, økende fart og mobile kontroller.",
    badge: "Retro",
    previewClass: "preview-snake",
  },
  {
    href: "/tetris",
    title: "Tetris With Effects",
    description: "Retro Tetris med hold, ghost piece, lyd og nytt Sprint 40-subspill.",
    badge: "Classic",
    previewClass: "preview-tetris",
  },
  {
    href: "/tux-racer/levels.html",
    title: "Tux Racer",
    description: "Klassisk pingovin-racingspill i nettleseren. Velg blant 20 baner og tre ulike miljøer.",
    badge: "Racing",
    previewClass: "preview-tux",
  },
] as const;

export function GameHub() {
  return (
    <main className="hub-page">
      <header className="hub-hero">
        <p className="hub-kicker">Mini Game Hub</p>
        <h1>Velg et spill</h1>
        <p>
          En liten portal med flere browser-spill. Start med farm eller hopp rett inn i
          bubble shooter, test refleksene i Neon Snake, eller spill Tetris med submodes.
        </p>
      </header>

      <section className="hub-grid">
        {GAMES.map((game) => (
          <article key={game.href} className="hub-card">
            <div className={`hub-preview ${game.previewClass}`} aria-hidden />
            <div className="hub-content">
              <span className="hub-badge">{game.badge}</span>
              <h2>{game.title}</h2>
              <p>{game.description}</p>
            </div>
            <Link href={game.href} className="hub-play-btn">
              Spill
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
