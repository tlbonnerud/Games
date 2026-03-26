import Link from "next/link";

export default function TetrisPage() {
  return (
    <main className="tetris-frame-page">
      <div className="tetris-frame-header">
        <Link href="/" className="hub-back-link">
          Til Game Hub
        </Link>
      </div>
      <section className="tetris-frame-shell" aria-label="Tetris">
        <iframe
          src="/tetris-with-effects.html"
          title="Tetris With Effects"
          className="tetris-frame"
          loading="lazy"
        />
      </section>
    </main>
  );
}
