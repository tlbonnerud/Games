"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Direction = "up" | "down" | "left" | "right";
type PlayStatus = "ready" | "running" | "paused" | "gameover";

interface GridPoint {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  hue: number;
}

interface SnakeRuntime {
  snake: GridPoint[];
  previousSnake: GridPoint[];
  direction: Direction;
  queuedDirection: Direction | null;
  food: GridPoint;
  status: PlayStatus;
  score: number;
  foodsEaten: number;
  bestScore: number;
  tickMs: number;
  accumulator: number;
  flash: number;
  shake: number;
  particles: Particle[];
}

const COLS = 24;
const ROWS = 18;
const CELL_SIZE = 30;
const ARENA_WIDTH = COLS * CELL_SIZE;
const ARENA_HEIGHT = ROWS * CELL_SIZE;

const START_TICK_MS = 160;
const MIN_TICK_MS = 72;
const SPEED_STEP_MS = 4;
const BEST_SCORE_KEY = "snake-neon-best-score";
const INITIAL_SNAKE_LENGTH = 5;

const DIRECTION_VECTORS: Record<Direction, GridPoint> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function clonePoint(point: GridPoint): GridPoint {
  return { x: point.x, y: point.y };
}

function samePoint(a: GridPoint, b: GridPoint): boolean {
  return a.x === b.x && a.y === b.y;
}

function pointKey(point: GridPoint): string {
  return `${point.x},${point.y}`;
}

function isOpposite(next: Direction, current: Direction): boolean {
  return (
    (next === "up" && current === "down") ||
    (next === "down" && current === "up") ||
    (next === "left" && current === "right") ||
    (next === "right" && current === "left")
  );
}

function interpolate(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function speedLevel(tickMs: number): number {
  return Math.max(1, Math.round((START_TICK_MS - tickMs) / 10) + 1);
}

function createInitialSnake(): GridPoint[] {
  const startX = Math.floor(COLS / 2);
  const startY = Math.floor(ROWS / 2);
  const snake: GridPoint[] = [];

  for (let index = 0; index < INITIAL_SNAKE_LENGTH; index += 1) {
    snake.push({ x: startX - index, y: startY });
  }

  return snake;
}

function createFood(occupied: GridPoint[]): GridPoint {
  const occupiedSet = new Set(occupied.map(pointKey));
  const maxAttempts = COLS * ROWS;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };

    if (!occupiedSet.has(pointKey(candidate))) {
      return candidate;
    }
  }

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const fallback = { x, y };
      if (!occupiedSet.has(pointKey(fallback))) {
        return fallback;
      }
    }
  }

  return { x: 0, y: 0 };
}

function createEatParticles(food: GridPoint): Particle[] {
  const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;
  const particles: Particle[] = [];

  for (let index = 0; index < 22; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 120 + Math.random() * 220;
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 460 + Math.random() * 300,
      maxLife: 760,
      radius: 1.8 + Math.random() * 2.8,
      hue: 22 + Math.random() * 25,
    });
  }

  return particles;
}

function createRuntime(bestScore: number): SnakeRuntime {
  const snake = createInitialSnake();
  return {
    snake,
    previousSnake: snake.map(clonePoint),
    direction: "right",
    queuedDirection: null,
    food: createFood(snake),
    status: "ready",
    score: 0,
    foodsEaten: 0,
    bestScore,
    tickMs: START_TICK_MS,
    accumulator: 0,
    flash: 0,
    shake: 0,
    particles: [],
  };
}

function readStoredBestScore(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const storedBestScore = window.localStorage.getItem(BEST_SCORE_KEY);
    const parsedScore = storedBestScore ? Number.parseInt(storedBestScore, 10) : 0;
    return Number.isFinite(parsedScore) && parsedScore > 0 ? parsedScore : 0;
  } catch {
    return 0;
  }
}

function drawBackdrop(context: CanvasRenderingContext2D, timeMs: number): void {
  const verticalGradient = context.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
  verticalGradient.addColorStop(0, "#061816");
  verticalGradient.addColorStop(1, "#103228");

  context.fillStyle = verticalGradient;
  context.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  for (let index = 0; index < 4; index += 1) {
    const orbit = timeMs * (0.00023 + index * 0.00004) + index * 1.5;
    const x = ((Math.sin(orbit) + 1) / 2) * ARENA_WIDTH;
    const y = ((Math.cos(orbit * 1.26) + 1) / 2) * ARENA_HEIGHT;
    const glow = context.createRadialGradient(x, y, 0, x, y, 150 + index * 32);
    glow.addColorStop(0, `rgba(98, 244, 174, ${0.13 - index * 0.018})`);
    glow.addColorStop(1, "rgba(7, 26, 21, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  }

  context.strokeStyle = "rgba(185, 255, 222, 0.08)";
  context.lineWidth = 1;
  context.beginPath();
  for (let x = 0; x <= ARENA_WIDTH; x += CELL_SIZE) {
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, ARENA_HEIGHT);
  }
  for (let y = 0; y <= ARENA_HEIGHT; y += CELL_SIZE) {
    context.moveTo(0, y + 0.5);
    context.lineTo(ARENA_WIDTH, y + 0.5);
  }
  context.stroke();

  const scanOffset = (timeMs * 0.06) % (CELL_SIZE * 2);
  context.fillStyle = "rgba(197, 255, 234, 0.04)";
  for (let y = -CELL_SIZE * 2; y < ARENA_HEIGHT + CELL_SIZE * 2; y += CELL_SIZE * 2) {
    context.fillRect(0, y + scanOffset, ARENA_WIDTH, CELL_SIZE * 0.45);
  }
}

function drawFood(context: CanvasRenderingContext2D, food: GridPoint, timeMs: number): void {
  const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;
  const pulse = 1 + Math.sin(timeMs * 0.012) * 0.12;
  const coreRadius = CELL_SIZE * 0.24 * pulse;

  context.save();
  context.translate(centerX, centerY);
  context.rotate(timeMs * 0.0018);

  context.shadowColor = "rgba(255, 162, 81, 0.9)";
  context.shadowBlur = 20;

  const gemGradient = context.createLinearGradient(0, -coreRadius, 0, coreRadius);
  gemGradient.addColorStop(0, "#ffe6a5");
  gemGradient.addColorStop(0.55, "#ff9452");
  gemGradient.addColorStop(1, "#cf4b19");

  context.fillStyle = gemGradient;
  context.beginPath();
  context.moveTo(0, -coreRadius * 1.45);
  context.lineTo(coreRadius * 1.05, 0);
  context.lineTo(0, coreRadius * 1.45);
  context.lineTo(-coreRadius * 1.05, 0);
  context.closePath();
  context.fill();

  context.shadowBlur = 0;
  context.strokeStyle = "rgba(255, 214, 150, 0.75)";
  context.lineWidth = 1.8;
  context.beginPath();
  context.arc(0, 0, coreRadius * 1.88 + Math.sin(timeMs * 0.013) * 2.4, 0, Math.PI * 2);
  context.stroke();

  context.restore();
}

function drawParticles(context: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const particle of particles) {
    const alpha = Math.max(0, particle.life / particle.maxLife);
    context.fillStyle = `hsla(${particle.hue}, 100%, 68%, ${alpha})`;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }
}

function drawSnake(
  context: CanvasRenderingContext2D,
  runtime: SnakeRuntime,
  interpolationFactor: number,
  timeMs: number,
): void {
  const interpolated = runtime.snake.map((segment, index) => {
    const previous =
      runtime.previousSnake[Math.min(index, runtime.previousSnake.length - 1)] ?? segment;
    return {
      x: interpolate(previous.x, segment.x, interpolationFactor),
      y: interpolate(previous.y, segment.y, interpolationFactor),
      index,
    };
  });

  if (interpolated.length === 0) {
    return;
  }

  context.lineWidth = CELL_SIZE * 0.62;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "rgba(46, 140, 94, 0.88)";
  context.beginPath();
  interpolated.forEach((segment, index) => {
    const px = segment.x * CELL_SIZE + CELL_SIZE / 2;
    const py = segment.y * CELL_SIZE + CELL_SIZE / 2;
    if (index === 0) {
      context.moveTo(px, py);
    } else {
      context.lineTo(px, py);
    }
  });
  context.stroke();

  for (let index = interpolated.length - 1; index >= 0; index -= 1) {
    const segment = interpolated[index];
    const px = segment.x * CELL_SIZE + CELL_SIZE / 2;
    const py = segment.y * CELL_SIZE + CELL_SIZE / 2;
    const pulse = 1 + Math.sin(timeMs * 0.006 - segment.index * 0.34) * 0.03;
    const radius = CELL_SIZE * (segment.index === 0 ? 0.44 : 0.38) * pulse;
    const segmentGradient = context.createRadialGradient(
      px - radius * 0.45,
      py - radius * 0.56,
      radius * 0.2,
      px,
      py,
      radius * 1.24,
    );

    if (segment.index === 0) {
      segmentGradient.addColorStop(0, "#eeffe2");
      segmentGradient.addColorStop(0.6, "#86f8ac");
      segmentGradient.addColorStop(1, "#2d9b5d");
    } else {
      segmentGradient.addColorStop(0, "#b8ffc8");
      segmentGradient.addColorStop(0.65, "#54d98c");
      segmentGradient.addColorStop(1, "#23734a");
    }

    context.fillStyle = segmentGradient;
    context.shadowColor = "rgba(79, 238, 162, 0.35)";
    context.shadowBlur = segment.index === 0 ? 18 : 12;
    context.beginPath();
    context.arc(px, py, radius, 0, Math.PI * 2);
    context.fill();
  }

  context.shadowBlur = 0;

  const head = interpolated[0];
  const headX = head.x * CELL_SIZE + CELL_SIZE / 2;
  const headY = head.y * CELL_SIZE + CELL_SIZE / 2;
  const forward = DIRECTION_VECTORS[runtime.direction];
  const normal = { x: -forward.y, y: forward.x };
  const eyeSpacing = CELL_SIZE * 0.17;
  const eyeOffset = CELL_SIZE * 0.17;
  const eyeRadius = CELL_SIZE * 0.09;

  for (const side of [-1, 1] as const) {
    const eyeX = headX + forward.x * eyeOffset + normal.x * eyeSpacing * side;
    const eyeY = headY + forward.y * eyeOffset + normal.y * eyeSpacing * side;
    const pupilX = eyeX + forward.x * (eyeRadius * 0.28);
    const pupilY = eyeY + forward.y * (eyeRadius * 0.28);

    context.fillStyle = "#f6fff8";
    context.beginPath();
    context.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#133826";
    context.beginPath();
    context.arc(pupilX, pupilY, eyeRadius * 0.52, 0, Math.PI * 2);
    context.fill();
  }

  if (Math.sin(timeMs * 0.018) > 0.7) {
    const mouthX = headX + forward.x * CELL_SIZE * 0.33;
    const mouthY = headY + forward.y * CELL_SIZE * 0.33;
    const tongueLength = CELL_SIZE * 0.22;
    const tongueSpread = CELL_SIZE * 0.07;

    context.strokeStyle = "#ff8a78";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(mouthX, mouthY);
    context.lineTo(
      mouthX + forward.x * tongueLength + normal.x * tongueSpread,
      mouthY + forward.y * tongueLength + normal.y * tongueSpread,
    );
    context.moveTo(mouthX, mouthY);
    context.lineTo(
      mouthX + forward.x * tongueLength - normal.x * tongueSpread,
      mouthY + forward.y * tongueLength - normal.y * tongueSpread,
    );
    context.stroke();
  }
}

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bestScore, setBestScore] = useState(() => readStoredBestScore());
  const runtimeRef = useRef<SnakeRuntime>(createRuntime(bestScore));
  const [status, setStatus] = useState<PlayStatus>("ready");
  const [score, setScore] = useState(0);
  const [length, setLength] = useState(INITIAL_SNAKE_LENGTH);
  const [level, setLevel] = useState(1);

  const syncHud = useCallback(() => {
    const runtime = runtimeRef.current;
    setScore(runtime.score);
    setLength(runtime.snake.length);
    setLevel(speedLevel(runtime.tickMs));
  }, []);

  const startGame = useCallback(() => {
    const runtime = runtimeRef.current;
    if (runtime.status === "ready" || runtime.status === "paused") {
      runtime.status = "running";
      setStatus("running");
    }
  }, []);

  const pauseOrResume = useCallback(() => {
    const runtime = runtimeRef.current;
    if (runtime.status === "running") {
      runtime.status = "paused";
      setStatus("paused");
      return;
    }

    if (runtime.status === "paused") {
      runtime.status = "running";
      setStatus("running");
    }
  }, []);

  const restartGame = useCallback(
    (startImmediately = false) => {
      const best = runtimeRef.current.bestScore;
      const freshRuntime = createRuntime(best);
      if (startImmediately) {
        freshRuntime.status = "running";
      }
      runtimeRef.current = freshRuntime;
      setStatus(freshRuntime.status);
      syncHud();
      setBestScore(best);
    },
    [syncHud],
  );

  const queueDirection = useCallback((direction: Direction) => {
    const runtime = runtimeRef.current;

    if (runtime.status === "gameover" || runtime.status === "paused") {
      return;
    }

    if (runtime.status === "ready") {
      runtime.status = "running";
      setStatus("running");
    }

    const activeDirection = runtime.queuedDirection ?? runtime.direction;
    if (isOpposite(direction, activeDirection)) {
      return;
    }

    runtime.queuedDirection = direction;
  }, []);

  const finishGame = useCallback(() => {
    const runtime = runtimeRef.current;
    runtime.status = "gameover";
    runtime.shake = 16;
    runtime.accumulator = 0;
    setStatus("gameover");
    // Save score to DB (fire-and-forget, ignore errors)
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id: "neon-snake", score: runtime.score }),
    }).catch(() => {});
  }, []);

  const stepGame = useCallback(() => {
    const runtime = runtimeRef.current;
    if (runtime.status !== "running") {
      return;
    }

    if (runtime.queuedDirection && !isOpposite(runtime.queuedDirection, runtime.direction)) {
      runtime.direction = runtime.queuedDirection;
    }
    runtime.queuedDirection = null;

    const head = runtime.snake[0];
    const movement = DIRECTION_VECTORS[runtime.direction];
    const nextHead = {
      x: head.x + movement.x,
      y: head.y + movement.y,
    };

    if (nextHead.x < 0 || nextHead.x >= COLS || nextHead.y < 0 || nextHead.y >= ROWS) {
      finishGame();
      return;
    }

    const hitsFood = samePoint(nextHead, runtime.food);
    const collisionCandidates = hitsFood ? runtime.snake : runtime.snake.slice(0, -1);
    if (collisionCandidates.some((segment) => samePoint(segment, nextHead))) {
      finishGame();
      return;
    }

    runtime.previousSnake = runtime.snake.map(clonePoint);

    const movedSnake = [nextHead, ...runtime.snake];
    if (!hitsFood) {
      movedSnake.pop();
    }
    runtime.snake = movedSnake;

    if (hitsFood) {
      runtime.foodsEaten += 1;
      runtime.score += 10 + speedLevel(runtime.tickMs) * 2;
      runtime.flash = 1;
      runtime.particles.push(...createEatParticles(runtime.food));
      runtime.food = createFood(runtime.snake);
      runtime.tickMs = Math.max(MIN_TICK_MS, START_TICK_MS - runtime.foodsEaten * SPEED_STEP_MS);

      if (runtime.score > runtime.bestScore) {
        runtime.bestScore = runtime.score;
        setBestScore(runtime.score);
        try {
          window.localStorage.setItem(BEST_SCORE_KEY, String(runtime.score));
        } catch {
          // Ignore localStorage failures and continue gameplay.
        }
      }
    }

    syncHud();
  }, [finishGame, syncHud]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "arrowup" || key === "w") {
        event.preventDefault();
        queueDirection("up");
        return;
      }
      if (key === "arrowdown" || key === "s") {
        event.preventDefault();
        queueDirection("down");
        return;
      }
      if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        queueDirection("left");
        return;
      }
      if (key === "arrowright" || key === "d") {
        event.preventDefault();
        queueDirection("right");
        return;
      }
      if (key === " ") {
        event.preventDefault();
        if (runtimeRef.current.status === "gameover") {
          restartGame(true);
          return;
        }
        if (runtimeRef.current.status === "ready") {
          startGame();
          return;
        }
        pauseOrResume();
        return;
      }
      if (key === "r") {
        event.preventDefault();
        restartGame(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [pauseOrResume, queueDirection, restartGame, startGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(ARENA_WIDTH * dpr);
    canvas.height = Math.floor(ARENA_HEIGHT * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    let animationFrame = 0;
    let previousTime = performance.now();

    const render = (timeMs: number) => {
      const runtime = runtimeRef.current;
      const interpolationFactor =
        runtime.status === "running"
          ? Math.min(1, runtime.accumulator / runtime.tickMs)
          : 1;

      context.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
      context.save();

      if (runtime.shake > 0) {
        context.translate(
          (Math.random() - 0.5) * runtime.shake,
          (Math.random() - 0.5) * runtime.shake,
        );
      }

      drawBackdrop(context, timeMs);
      drawFood(context, runtime.food, timeMs);
      drawSnake(context, runtime, interpolationFactor, timeMs);
      drawParticles(context, runtime.particles);

      if (runtime.flash > 0) {
        context.fillStyle = `rgba(255, 240, 182, ${runtime.flash * 0.28})`;
        context.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
      }

      context.restore();
    };

    const frame = (timeMs: number) => {
      const deltaMs = Math.min(50, timeMs - previousTime);
      previousTime = timeMs;

      const runtime = runtimeRef.current;
      if (runtime.status === "running") {
        runtime.accumulator += deltaMs;

        while (runtime.accumulator >= runtime.tickMs) {
          runtime.accumulator -= runtime.tickMs;
          stepGame();
          if (runtime.status !== "running") {
            runtime.accumulator = 0;
            break;
          }
        }
      } else {
        runtime.accumulator = 0;
      }

      runtime.flash = Math.max(0, runtime.flash - deltaMs / 200);
      runtime.shake = Math.max(0, runtime.shake - deltaMs / 42);
      if (runtime.particles.length > 0) {
        const nextParticles: Particle[] = [];
        for (const particle of runtime.particles) {
          const life = particle.life - deltaMs;
          if (life <= 0) {
            continue;
          }

          const damping = Math.pow(0.986, deltaMs / 16.67);
          const nextVx = particle.vx * damping;
          const nextVy = particle.vy * damping + (40 * deltaMs) / 1000;
          nextParticles.push({
            ...particle,
            x: particle.x + (nextVx * deltaMs) / 1000,
            y: particle.y + (nextVy * deltaMs) / 1000,
            vx: nextVx,
            vy: nextVy,
            life,
          });
        }
        runtime.particles = nextParticles;
      }

      render(timeMs);
      animationFrame = window.requestAnimationFrame(frame);
    };

    animationFrame = window.requestAnimationFrame(frame);
    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [stepGame]);

  const overlayTitle =
    status === "gameover" ? "Game over" : status === "paused" ? "Pause" : "Neon Snake";
  const overlayDescription =
    status === "gameover"
      ? "Du krasjet. Trykk spill igjen og slå rekorden din."
      : status === "paused"
        ? "Spillet er pauset. Fortsett når du er klar."
        : "Bruk piltaster/WASD eller knappene under for å styre.";
  const overlayButtonLabel =
    status === "gameover" ? "Spill igjen" : status === "paused" ? "Fortsett" : "Start";

  return (
    <main className="snake-page">
      <div className="snake-header">
        <Link href="/" className="hub-back-link">
          Til Game Hub
        </Link>
        <h1>Neon Snake</h1>
        <div className="snake-header-actions">
          <button
            type="button"
            className="pixel-btn"
            onClick={() => {
              if (status === "running" || status === "paused") {
                pauseOrResume();
                return;
              }
              if (status === "gameover") {
                restartGame(true);
                return;
              }
              startGame();
            }}
          >
            {status === "running"
              ? "Pause"
              : status === "paused"
                ? "Fortsett"
                : status === "gameover"
                  ? "Spill igjen"
                  : "Start"}
          </button>
          <button type="button" className="pixel-btn" onClick={() => restartGame(true)}>
            Restart
          </button>
        </div>
      </div>

      <div className="snake-meta">
        <span>Score: {score}</span>
        <span>Best: {bestScore}</span>
        <span>Lengde: {length}</span>
        <span>Fartnivå: {level}</span>
      </div>

      <section className="snake-stage-wrap">
        <div className="snake-stage">
          <canvas
            ref={canvasRef}
            className="snake-canvas"
            width={ARENA_WIDTH}
            height={ARENA_HEIGHT}
            aria-label="Snake spillflate"
          />

          {status !== "running" ? (
            <div className="snake-overlay" role="status" aria-live="polite">
              <h2>{overlayTitle}</h2>
              <p>{overlayDescription}</p>
              <button
                type="button"
                className="pixel-btn"
                onClick={() => {
                  if (status === "gameover") {
                    restartGame(true);
                    return;
                  }
                  startGame();
                }}
              >
                {overlayButtonLabel}
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <div className="snake-controls" aria-label="Retningskontroller">
        <button type="button" onClick={() => queueDirection("up")} aria-label="Opp">
          ▲
        </button>
        <button type="button" onClick={() => queueDirection("left")} aria-label="Venstre">
          ◀
        </button>
        <button type="button" onClick={() => queueDirection("down")} aria-label="Ned">
          ▼
        </button>
        <button type="button" onClick={() => queueDirection("right")} aria-label="Høyre">
          ▶
        </button>
      </div>

      <p className="snake-help">
        Tastatur: piltaster/WASD. Mellomrom pauser/fortsetter. R starter nytt spill.
      </p>
    </main>
  );
}
