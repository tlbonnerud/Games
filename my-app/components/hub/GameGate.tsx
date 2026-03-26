"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT, readAuthState } from "@/components/hub/auth";

interface GameGateProps {
  children: React.ReactNode;
}

export function GameGate({ children }: GameGateProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLoggedIn(readAuthState().isLoggedIn);

    const handler = () => setIsLoggedIn(readAuthState().isLoggedIn);
    window.addEventListener(AUTH_CHANGE_EVENT, handler);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, handler);
  }, []);

  // Venter på hydration
  if (isLoggedIn === null) return null;

  if (!isLoggedIn) {
    return (
      <div className="game-gate-overlay">
        <div className="game-gate-card">
          <div className="game-gate-icon">🎮</div>
          <h2 className="game-gate-title">Logg inn for å spille</h2>
          <p className="game-gate-desc">
            Du må være innlogget for å spille. Det er gratis og tar bare ett minutt.
          </p>
          <div className="game-gate-actions">
            <Link href="/login" className="game-gate-btn-primary">
              Logg inn
            </Link>
            <Link href="/signup" className="game-gate-btn-secondary">
              Opprett konto
            </Link>
          </div>
          <div className="game-gate-privacy">
            <p>
              <strong>Personvern:</strong> Vi lagrer kun e-post og brukernavn for å lagre
              spillprogresjonen din og vise deg på leaderboard. Ingen data selges eller deles
              med tredjeparter.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
