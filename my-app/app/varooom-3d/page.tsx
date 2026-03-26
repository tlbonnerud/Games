import Link from "next/link";

export default function Varooom3DPage() {
  return (
    <main className="tetris-frame-page">
      <div className="tetris-frame-header">
        <Link href="/" className="hub-back-link">
          Til Game Hub
        </Link>
      </div>
      <section className="tetris-frame-shell" aria-label="VAROOOM 3D">
        <iframe src="/varooom-3d/index.html" title="VAROOOM 3D" className="tetris-frame" />
      </section>
    </main>
  );
}
