"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type BubbleBoard,
  type BubbleColor,
  cloneBoard,
  createInitialBoard,
  createSeededBoard,
  findNearestEmptyCell,
  getSeededShooterColors,
  getCellCenter,
  isBoardEmpty,
  pushBoardDown,
  randomColor,
  resolveMatchAndFalls,
} from "@/lib/bubble-shooter";

const ROWS = 12;
const COLS = 12;
const FILLED_ROWS = 7;

const CELL_SIZE = 34;
const ROW_HEIGHT = 29;
const BUBBLE_RADIUS = 16;
const SHOOT_SPEED = 560;
const SHOTS_PER_ROW_DROP = 6;

const STAGE_WIDTH = COLS * CELL_SIZE + CELL_SIZE / 2;
const STAGE_HEIGHT = ROWS * ROW_HEIGHT + 170;
const SHOOTER_X = STAGE_WIDTH / 2;
const SHOOTER_Y = STAGE_HEIGHT - 52;

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: BubbleColor;
}

function clampAimAngle(angle: number): number {
  const minAngle = -Math.PI + 0.23;
  const maxAngle = -0.23;
  return Math.max(minAngle, Math.min(maxAngle, angle));
}

function detectBubbleCollision(
  projectile: Projectile,
  board: BubbleBoard,
  parityOffset: number,
): boolean {
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (!board[row][col]) {
        continue;
      }

      const center = getCellCenter(
        row,
        col,
        CELL_SIZE,
        ROW_HEIGHT,
        parityOffset,
      );
      const distance = Math.hypot(center.x - projectile.x, center.y - projectile.y);
      if (distance <= BUBBLE_RADIUS * 2 - 2) {
        return true;
      }
    }
  }

  return false;
}

export function BubbleShooterGame() {
  const [board, setBoard] = useState<BubbleBoard>(() =>
    createSeededBoard(ROWS, COLS, FILLED_ROWS),
  );
  const [currentColor, setCurrentColor] = useState<BubbleColor>(
    () => getSeededShooterColors().current,
  );
  const [nextColor, setNextColor] = useState<BubbleColor>(
    () => getSeededShooterColors().next,
  );
  const [aimAngle, setAimAngle] = useState<number>(-Math.PI / 2);
  const [projectile, setProjectile] = useState<Projectile | null>(null);
  const [score, setScore] = useState(0);
  const [shotsFired, setShotsFired] = useState(0);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [parityOffset, setParityOffset] = useState(0);

  const boardRef = useRef(board);
  const shotsFiredRef = useRef(0);
  const currentColorRef = useRef(currentColor);
  const nextColorRef = useRef(nextColor);
  const statusRef = useRef(status);
  const projectileRef = useRef<Projectile | null>(projectile);
  const parityOffsetRef = useRef(0);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    currentColorRef.current = currentColor;
  }, [currentColor]);

  useEffect(() => {
    nextColorRef.current = nextColor;
  }, [nextColor]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    projectileRef.current = projectile;
  }, [projectile]);

  useEffect(() => {
    parityOffsetRef.current = parityOffset;
  }, [parityOffset]);

  const resetGame = useCallback(() => {
    const freshBoard = createInitialBoard(ROWS, COLS, FILLED_ROWS);
    setBoard(freshBoard);
    boardRef.current = freshBoard;

    const first = randomColor();
    const second = randomColor();

    setCurrentColor(first);
    setNextColor(second);
    currentColorRef.current = first;
    nextColorRef.current = second;

    setProjectile(null);
    projectileRef.current = null;
    setScore(0);
    setShotsFired(0);
    shotsFiredRef.current = 0;
    setParityOffset(0);
    parityOffsetRef.current = 0;
    setStatus("playing");
    statusRef.current = "playing";
  }, []);

  const attachProjectile = useCallback((impact: Projectile) => {
    const workingBoard = cloneBoard(boardRef.current);
    const targetCell = findNearestEmptyCell(
      workingBoard,
      impact.x,
      impact.y,
      CELL_SIZE,
      ROW_HEIGHT,
      parityOffsetRef.current,
    );

    if (!targetCell) {
      setStatus("lost");
      statusRef.current = "lost";
      return;
    }

    workingBoard[targetCell.row][targetCell.col] = impact.color;

    const { removed, board: resolvedBoard } = resolveMatchAndFalls(
      workingBoard,
      targetCell,
      parityOffsetRef.current,
    );
    let nextBoard = resolvedBoard;
    let nextParityOffset = parityOffsetRef.current;
    const nextShots = shotsFiredRef.current + 1;
    shotsFiredRef.current = nextShots;
    setShotsFired(nextShots);
    if (removed > 0) {
      setScore((previous) => previous + removed * 15);
    }

    const nextCurrent = nextColorRef.current;
    const generatedNext = randomColor();
    setCurrentColor(nextCurrent);
    setNextColor(generatedNext);
    currentColorRef.current = nextCurrent;
    nextColorRef.current = generatedNext;

    if (isBoardEmpty(nextBoard)) {
      setBoard(nextBoard);
      boardRef.current = nextBoard;
      setStatus("won");
      statusRef.current = "won";
      return;
    }

    if (nextShots % SHOTS_PER_ROW_DROP === 0) {
      const shifted = pushBoardDown(cloneBoard(nextBoard));
      nextBoard = shifted.board;
      nextParityOffset = (nextParityOffset + 1) % 2;
      setParityOffset(nextParityOffset);
      parityOffsetRef.current = nextParityOffset;

      if (shifted.overflow) {
        setBoard(nextBoard);
        boardRef.current = nextBoard;
        setStatus("lost");
        statusRef.current = "lost";
        return;
      }
    }

    setBoard(nextBoard);
    boardRef.current = nextBoard;
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    let previousTime = performance.now();
    let timeSinceVisualUpdate = 0;

    const tick = (now: number) => {
      const delta = Math.min((now - previousTime) / 1000, 0.033);
      previousTime = now;

      const activeProjectile = projectileRef.current;
      if (activeProjectile && statusRef.current === "playing") {
        let nextX = activeProjectile.x + activeProjectile.vx * delta;
        const nextY = activeProjectile.y + activeProjectile.vy * delta;
        let nextVx = activeProjectile.vx;

        if (nextX <= BUBBLE_RADIUS || nextX >= STAGE_WIDTH - BUBBLE_RADIUS) {
          nextVx *= -1;
          nextX = Math.max(BUBBLE_RADIUS, Math.min(STAGE_WIDTH - BUBBLE_RADIUS, nextX));
        }

        const candidate: Projectile = {
          ...activeProjectile,
          x: nextX,
          y: nextY,
          vx: nextVx,
        };

        const hitTop = candidate.y <= BUBBLE_RADIUS;
        const hitBubble = detectBubbleCollision(
          candidate,
          boardRef.current,
          parityOffsetRef.current,
        );

        if (hitTop || hitBubble) {
          projectileRef.current = null;
          setProjectile(null);
          attachProjectile(candidate);
        } else {
          projectileRef.current = candidate;
          timeSinceVisualUpdate += delta;
          if (timeSinceVisualUpdate >= 1 / 30) {
            setProjectile(candidate);
            timeSinceVisualUpdate = 0;
          }
        }
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [attachProjectile]);

  const updateAimFromPoint = useCallback((clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    const angle = Math.atan2(localY - SHOOTER_Y, localX - SHOOTER_X);
    setAimAngle(clampAimAngle(angle));
  }, []);

  const shoot = useCallback(() => {
    if (statusRef.current !== "playing") {
      return;
    }

    if (projectileRef.current) {
      return;
    }

    const launched: Projectile = {
      x: SHOOTER_X,
      y: SHOOTER_Y - 8,
      vx: Math.cos(aimAngle) * SHOOT_SPEED,
      vy: Math.sin(aimAngle) * SHOOT_SPEED,
      color: currentColorRef.current,
    };

    projectileRef.current = launched;
    setProjectile(launched);
  }, [aimAngle]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        shoot();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [shoot]);

  const dots = useMemo(() => {
    if (projectile) {
      return [];
    }

    return Array.from({ length: 8 }, (_, index) => {
      const distance = 34 + index * 33;
      return {
        x: SHOOTER_X + Math.cos(aimAngle) * distance,
        y: SHOOTER_Y + Math.sin(aimAngle) * distance,
      };
    });
  }, [aimAngle, projectile]);

  const boardNodes = useMemo(
    () =>
      board.map((row, rowIndex) =>
        row.map((bubble, colIndex) => {
          if (!bubble) {
            return null;
          }

          const center = getCellCenter(
            rowIndex,
            colIndex,
            CELL_SIZE,
            ROW_HEIGHT,
            parityOffset,
          );

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`bubble-piece bubble-${bubble}`}
              style={{
                left: `${center.x - BUBBLE_RADIUS}px`,
                top: `${center.y - BUBBLE_RADIUS}px`,
              }}
            />
          );
        }),
      ),
    [board, parityOffset],
  );

  const shotCycleProgress = shotsFired % SHOTS_PER_ROW_DROP;
  const shotsUntilDrop =
    shotCycleProgress === 0
      ? SHOTS_PER_ROW_DROP
      : SHOTS_PER_ROW_DROP - shotCycleProgress;

  return (
    <main className="bubble-page">
      <div className="bubble-header">
        <Link href="/" className="hub-back-link">
          Til Game Hub
        </Link>
        <h1>Bubble Shooter</h1>
        <button type="button" className="pixel-btn" onClick={resetGame}>
          Restart
        </button>
      </div>

      <div className="bubble-meta">
        <span>Score: {score}</span>
        <span>Shots: {shotsFired}</span>
        <span>Neste rad om: {shotsUntilDrop}</span>
        <span>
          Status: {status === "playing" ? "Spiller" : status === "won" ? "Vunnet" : "Tapt"}
        </span>
      </div>

      <div className="bubble-stage-wrap">
        <div
          ref={stageRef}
          className="bubble-stage"
          style={{ width: `${STAGE_WIDTH}px`, height: `${STAGE_HEIGHT}px` }}
          onMouseMove={(event) => updateAimFromPoint(event.clientX, event.clientY)}
          onClick={shoot}
          onTouchMove={(event) => {
            if (event.touches[0]) {
              updateAimFromPoint(event.touches[0].clientX, event.touches[0].clientY);
            }
          }}
        >
          <div className="bubble-grid-area">
            {boardNodes}
          </div>

          {dots.map((dot, index) => (
            <div
              key={`dot-${index}`}
              className="aim-dot"
              style={{ left: `${dot.x - 3}px`, top: `${dot.y - 3}px` }}
            />
          ))}

          {projectile ? (
            <div
              className={`bubble-piece bubble-${projectile.color} projectile`}
              style={{
                left: `${projectile.x - BUBBLE_RADIUS}px`,
                top: `${projectile.y - BUBBLE_RADIUS}px`,
              }}
            />
          ) : null}

          <div className="shooter-lane" />

          <div className="shooter-base">
            <div className={`bubble-piece bubble-${currentColor} shooter-current`} />
            <div className="next-bubble-slot">
              <span>Neste</span>
              <div className={`bubble-piece bubble-${nextColor} shooter-next`} />
            </div>
          </div>
        </div>
      </div>

      <p className="bubble-help">
        Pek oppover for å sikte, klikk for å skyte. Match 3+ av samme farge for å poppe bobler.
        Hver {SHOTS_PER_ROW_DROP}. kule kommer en ny rad ned.
      </p>
    </main>
  );
}
