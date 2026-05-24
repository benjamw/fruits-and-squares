import { BeansBoard } from "@utils/types";

const size = 10;
const maxAttempts = 1000;

export const colors = [
  { color: "#96beff", name: "Blue" },
  { color: "#b3dfa0", name: "Green" },
  { color: "#dfdfdf", name: "Grey" },
  { color: "#dfa0bf", name: "Pink" },
  { color: "#ff7b60", name: "Red" },
  { color: "#e6f388", name: "Yellow" },
  { color: "#b9b29e", name: "Dark grey" },
  { color: "#a3d2d8", name: "Turquoise" },
  { color: "#ffc992", name: "Salmon" },
  { color: "#bba3e2", name: "Purple" }
];

export const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1], [1, 0], [1, 1],
];

const gridDirections = [
  [-1, 0], [1, 0], // Up, Down
  [0, -1], [0, 1], // Left, Right
];

export const getCellsBetween = (from: [number, number], to: [number, number]): [number, number][] => {
  const cells: [number, number][] = [];
  const [x0, y0] = from;
  const [x1, y1] = to;
  
  // Calculate steps needed to interpolate between points
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const steps = Math.max(dx, dy);
  
  // Interpolate all cells along the path
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t);
    cells.push([x, y]);
  }
  
  return cells;
};

export const getColorName = (color: string) => {
  const foundColor = colors.find((c) => c.color === color);
  
  return foundColor ? foundColor.name.toLowerCase() : "unknown";
};

// Empty board where each cell is #fff (white)
export const createEmptyBeansBoard = () =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      color: "#fff",
      hasCross: false,
      hasBean: false,
    }))
  );

const isSafeToPlaceCross = (board: BeansBoard, row: number, col:number) => {
  return directions.every(([dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;
    
    return (
      newRow < 0 || newRow >= size || // Out of bounds
      newCol < 0 || newCol >= size || // Out of bounds
      !board[newRow][newCol].hasCross // No cross in this cell
    );
  });
};

const findAdjacentSquares = (board: BeansBoard, row: number, col: number) => {
  return gridDirections
    .map(([dx, dy]) => [row + dx, col + dy])
    .filter(
      ([newRow, newCol]) =>
        newRow >= 0 &&
        newRow < size &&
        newCol >= 0 &&
        newCol < size &&
        !board[newRow][newCol].hasCross && // No cross
        board[newRow][newCol].color === "#fff" // Empty square
    );
};

const colorAdjacentSquares = (board: BeansBoard): BeansBoard => {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));

  newBoard.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.hasCross) {
        const adjacent = findAdjacentSquares(newBoard, rowIndex, colIndex);
        if (adjacent.length > 0) {
          const [randomRow, randomCol] =
            adjacent[Math.floor(Math.random() * adjacent.length)];
          newBoard[randomRow][randomCol].color = cell.color;
        }
      }
    });
  });

  return newBoard;
};

const fillBoardWithColor = (board: BeansBoard): BeansBoard => {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  let filled = false;

  while (!filled) {
    filled = true; // Assume the board will be filled
    for (let rowIndex = 0; rowIndex < size; rowIndex++) {
      for (let colIndex = 0; colIndex < size; colIndex++) {
        const cell = newBoard[rowIndex][colIndex];

        // If the square has no color, skip it
        if (!cell.color) continue;

        // Check if any adjacent square is empty
        const adjacent = findAdjacentSquares(newBoard, rowIndex, colIndex);
        if (adjacent.length > 0) {
          // Pick a random adjacent square to color
          const [randomRow, randomCol] =
            adjacent[Math.floor(Math.random() * adjacent.length)];
          newBoard[randomRow][randomCol].color = cell.color;
          filled = false; // The board is not yet fully filled
        }
      }
    }
  }

  return newBoard;
};

const removeCrosses = (board: BeansBoard) => {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      hasCross: false,
    }))
  );
};

export const tryGenerateBoard = () => {
  const board = createEmptyBeansBoard();

  const usedColumns = new Set();
  let isValid = true;

  for (let rowIndex = 0; rowIndex < size; rowIndex++) {
    let colIndex = 0;
    let foundValidSpot = false;

    for (let tries = 0; tries < size; tries++) { // Try at most 10 columns
      colIndex = Math.floor(Math.random() * size);
      if (
        !usedColumns.has(colIndex) && // Ensure the column is unique
        isSafeToPlaceCross(board, rowIndex, colIndex) // Ensure no adjacent crosses
      ) {
        foundValidSpot = true;
        break;
      }
    }

    if (!foundValidSpot) {
      isValid = false; // Restart placement if no valid spot found
      break;
    }

    usedColumns.add(colIndex);
    board[rowIndex][colIndex].hasCross = true;
    board[rowIndex][colIndex].color = colors[rowIndex].color;
  }

  if (!isValid) {
    return false;
  }

  return board;
};

export const generateBeansBoard = () => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    let board = tryGenerateBoard();
    if (board) {
      board = colorAdjacentSquares(board);
      board = fillBoardWithColor(board);
      board = removeCrosses(board);
      
      return board;
    }
    attempts++;
  }

  return null;
};

export const validateBoard = (board: BeansBoard) => {
  // Check each row for more than one 'hasBean'
  for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
    const rowHasBeanCount = board[rowIndex].filter(cell => cell.hasBean).length;
    if (rowHasBeanCount > 1) {
      return {
        valid: false,
        completed: false,
        message: `Row ${rowIndex + 1} has more than one bean`,
      };
    }
  }

  // Check each column for more than one 'hasBean'
  for (let colIndex = 0; colIndex < board[0].length; colIndex++) {
    const colHasBeanCount = board.reduce(
      (count, row) => (row[colIndex].hasBean ? count + 1 : count),
      0
    );
    if (colHasBeanCount > 1) {
      return {
        valid: false,
        completed: false,
        message: `Column ${colIndex + 1} has more than one bean`,
      };
    }
  }

  // Check each color section for more than one 'hasBean'
  const colorHasBeanCount: { [key: string]: number } = {};
  for (const cell of board.flat()) {
    if (cell.hasBean) {
      if (!colorHasBeanCount[cell.color]) {
        colorHasBeanCount[cell.color] = 0;
      }
      colorHasBeanCount[cell.color]++;
      if (colorHasBeanCount[cell.color] > 1) {
        return {
          valid: false,
          completed: false,
          message: `The ${getColorName(cell.color)} section has more than one bean`,
        };
      }
    }
  }

  for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
    for (let colIndex = 0; colIndex < board[rowIndex].length; colIndex++) {
      if (board[rowIndex][colIndex].hasBean) {
        for (const [dx, dy] of directions) {
          const newRow = rowIndex + dx;
          const newCol = colIndex + dy;
          if (
            newRow >= 0 && newRow < 10 &&
            newCol >= 0 && newCol < 10 &&
            board[newRow][newCol].hasBean
          ) {
            return {
              valid: false,
              completed: false,
              message: `Adjacent beans found at (${rowIndex + 1}, ${colIndex + 1}) and (${newRow + 1}, ${newCol + 1})`,
            };
          }
        }
      }
    }
  }

  // Count total `hasBean` cells on the board
  const totalHasBeans = board.flat().filter(cell => cell.hasBean).length;

  if (totalHasBeans === 10) {
    return {
      valid: true,
      completed: true,
      message: "Congratulations! You have solved the puzzle",
    };
  } else {
    return {
      valid: true,
      completed: false,
      message: "", // No message shown when valid but not exactly 10 beans
    };
  }
};

  