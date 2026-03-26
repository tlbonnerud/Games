export type BubbleColor = "red" | "blue" | "green" | "yellow" | "purple";

export interface BubbleCell {
  row: number;
  col: number;
}

export type BubbleBoard = (BubbleColor | null)[][];

const COLOR_POOL: BubbleColor[] = ["red", "blue", "green", "yellow", "purple"];

export function randomColor(): BubbleColor {
  return COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];
}

function createSeededGenerator(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createSeededBoard(
  rows: number,
  cols: number,
  filledRows: number,
  seed = 1337,
): BubbleBoard {
  const random = createSeededGenerator(seed);

  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, () => {
      if (row >= filledRows) {
        return null;
      }

      const colorIndex = Math.floor(random() * COLOR_POOL.length);
      return COLOR_POOL[colorIndex] ?? "red";
    }),
  );
}

export function getSeededShooterColors(seed = 2026): {
  current: BubbleColor;
  next: BubbleColor;
} {
  const random = createSeededGenerator(seed);
  const currentIndex = Math.floor(random() * COLOR_POOL.length);
  const nextIndex = Math.floor(random() * COLOR_POOL.length);

  return {
    current: COLOR_POOL[currentIndex] ?? "red",
    next: COLOR_POOL[nextIndex] ?? "blue",
  };
}

function randomColorFromPool(pool: BubbleColor[]): BubbleColor {
  if (pool.length === 0) {
    return randomColor();
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

export function getActiveColorPool(board: BubbleBoard): BubbleColor[] {
  const used = new Set<BubbleColor>();

  for (const row of board) {
    for (const cell of row) {
      if (cell !== null) {
        used.add(cell);
      }
    }
  }

  return used.size > 0 ? Array.from(used) : [...COLOR_POOL];
}

export function createInitialBoard(
  rows: number,
  cols: number,
  filledRows: number,
): BubbleBoard {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, () => (row < filledRows ? randomColor() : null)),
  );
}

export function cloneBoard(board: BubbleBoard): BubbleBoard {
  return board.map((row) => [...row]);
}

export function getCellCenter(
  row: number,
  col: number,
  cellSize: number,
  rowHeight: number,
  parityOffset = 0,
): { x: number; y: number } {
  const isOddRow = (row + parityOffset) % 2 !== 0;
  const x = col * cellSize + (isOddRow ? cellSize / 2 : 0) + cellSize / 2;
  const y = row * rowHeight + cellSize / 2;
  return { x, y };
}

export function getNeighbors(
  row: number,
  col: number,
  rows: number,
  cols: number,
  parityOffset = 0,
): BubbleCell[] {
  const offsetsEven = [
    [-1, -1],
    [-1, 0],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
  ];

  const offsetsOdd = [
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, 0],
    [1, 1],
  ];

  const offsets = (row + parityOffset) % 2 !== 0 ? offsetsOdd : offsetsEven;

  const neighbors: BubbleCell[] = [];
  for (const [deltaRow, deltaCol] of offsets) {
    const nextRow = row + deltaRow;
    const nextCol = col + deltaCol;

    if (nextRow < 0 || nextRow >= rows) {
      continue;
    }

    if (nextCol < 0 || nextCol >= cols) {
      continue;
    }

    neighbors.push({ row: nextRow, col: nextCol });
  }

  return neighbors;
}

export function findNearestEmptyCell(
  board: BubbleBoard,
  x: number,
  y: number,
  cellSize: number,
  rowHeight: number,
  parityOffset = 0,
): BubbleCell | null {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  if (rows === 0 || cols === 0) {
    return null;
  }

  const guessedRow = Math.round((y - cellSize / 2) / rowHeight);
  let bestCell: BubbleCell | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let row = guessedRow - 2; row <= guessedRow + 2; row += 1) {
    if (row < 0 || row >= rows) {
      continue;
    }

    const rowOffset = (row + parityOffset) % 2 !== 0 ? cellSize / 2 : 0;
    const guessedCol = Math.round((x - rowOffset - cellSize / 2) / cellSize);

    for (let col = guessedCol - 2; col <= guessedCol + 2; col += 1) {
      if (col < 0 || col >= cols) {
        continue;
      }

      if (board[row][col] !== null) {
        continue;
      }

      const center = getCellCenter(row, col, cellSize, rowHeight, parityOffset);
      const distance = Math.hypot(center.x - x, center.y - y);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestCell = { row, col };
      }
    }
  }

  if (bestCell) {
    return bestCell;
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (board[row][col] !== null) {
        continue;
      }

      const center = getCellCenter(row, col, cellSize, rowHeight, parityOffset);
      const distance = Math.hypot(center.x - x, center.y - y);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestCell = { row, col };
      }
    }
  }

  return bestCell;
}

export function findConnectedCluster(
  board: BubbleBoard,
  start: BubbleCell,
  color: BubbleColor,
  parityOffset = 0,
): BubbleCell[] {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const stack: BubbleCell[] = [start];
  const visited = new Set<string>();
  const cluster: BubbleCell[] = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    const key = `${current.row}:${current.col}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    if (board[current.row][current.col] !== color) {
      continue;
    }

    cluster.push(current);

    const neighbors = getNeighbors(
      current.row,
      current.col,
      rows,
      cols,
      parityOffset,
    );
    for (const neighbor of neighbors) {
      stack.push(neighbor);
    }
  }

  return cluster;
}

export function removeFloatingBubbles(board: BubbleBoard, parityOffset = 0): number {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const anchored = new Set<string>();
  const stack: BubbleCell[] = [];

  for (let col = 0; col < cols; col += 1) {
    if (board[0][col] !== null) {
      stack.push({ row: 0, col });
    }
  }

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    const key = `${current.row}:${current.col}`;
    if (anchored.has(key)) {
      continue;
    }

    if (board[current.row][current.col] === null) {
      continue;
    }

    anchored.add(key);

    const neighbors = getNeighbors(
      current.row,
      current.col,
      rows,
      cols,
      parityOffset,
    );
    for (const neighbor of neighbors) {
      stack.push(neighbor);
    }
  }

  let removed = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (board[row][col] === null) {
        continue;
      }

      const key = `${row}:${col}`;
      if (!anchored.has(key)) {
        board[row][col] = null;
        removed += 1;
      }
    }
  }

  return removed;
}

export function resolveMatchAndFalls(
  board: BubbleBoard,
  placedCell: BubbleCell,
  parityOffset = 0,
): { removed: number; board: BubbleBoard } {
  const color = board[placedCell.row][placedCell.col];
  if (!color) {
    return { removed: 0, board };
  }

  const connected = findConnectedCluster(board, placedCell, color, parityOffset);

  let removed = 0;

  if (connected.length >= 3) {
    for (const cell of connected) {
      if (board[cell.row][cell.col] !== null) {
        board[cell.row][cell.col] = null;
        removed += 1;
      }
    }

    removed += removeFloatingBubbles(board, parityOffset);
  }

  return { removed, board };
}

export function hasBubblesNearBottom(board: BubbleBoard, thresholdRow: number): boolean {
  for (let row = thresholdRow; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col] !== null) {
        return true;
      }
    }
  }

  return false;
}

export function isBoardEmpty(board: BubbleBoard): boolean {
  return board.every((row) => row.every((cell) => cell === null));
}

export function pushBoardDown(
  board: BubbleBoard,
  fillChance = 0.88,
): { board: BubbleBoard; overflow: boolean } {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  if (rows === 0 || cols === 0) {
    return { board, overflow: false };
  }

  const overflow = board[rows - 1].some((cell) => cell !== null);
  const colorPool = getActiveColorPool(board);

  for (let row = rows - 1; row > 0; row -= 1) {
    board[row] = [...board[row - 1]];
  }

  const nextTopRow: (BubbleColor | null)[] = Array.from(
    { length: cols },
    (): BubbleColor | null =>
      Math.random() < fillChance ? randomColorFromPool(colorPool) : null,
  );

  const hasAtLeastOneBubble = nextTopRow.some((cell) => cell !== null);
  if (!hasAtLeastOneBubble) {
    const guaranteedCol = Math.floor(Math.random() * cols);
    nextTopRow[guaranteedCol] = randomColorFromPool(colorPool);
  }

  board[0] = nextTopRow;

  return { board, overflow };
}
