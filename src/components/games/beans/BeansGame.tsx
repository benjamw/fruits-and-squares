import { useState, useEffect, useCallback, useRef } from "react";
import { createEmptyBeansBoard, validateBoard } from "./beansUtils";
import { BeansBoard, GameState, GameScore } from "@utils/types";
import refreshIcon from "@assets/refresh.svg";
import forwardsIcon from "@assets/skip-forward.svg";
import timerIcon from "@assets/timer.svg";
import { TertiaryIconButton } from "@components/ui/Buttons";
import { formatTimer } from "@components/games/gameUtils";
import BeansSquare from "./BeansSquare";
import GameOverlay from "../GameOverlay";

interface BeansGameProps {
  board: BeansBoard | null;
  index: number;
  players: GameScore[];
  gameState: GameState;
  puzzleComplete: () => void;
  startPuzzle: () => void;
  skipPuzzle: () => void;

}

const BeansGame = ({ board, index, players, gameState, puzzleComplete, startPuzzle, skipPuzzle }: BeansGameProps)  => {
  const [playableBoard, setPlayableBoard] = useState<BeansBoard>(createEmptyBeansBoard());
  const [initialBoard, setInitialBoard] = useState<BeansBoard>(createEmptyBeansBoard());
  const [alertState, setAlertState] = useState({ valid: true, message: "" });
  const isDraggingRef = useRef(false);
  const visitedRef = useRef<Set<string>>(new Set());

  const resetBoard = useCallback(() => {
    setPlayableBoard(JSON.parse(JSON.stringify(initialBoard)));

    const isValid = validateBoard(initialBoard);
    setAlertState({ valid: isValid.valid, message: isValid.message });
  }, [initialBoard]);

  useEffect(() => {
    if (board) {
      setAlertState({ valid: true, message: "" });
      setPlayableBoard(board);
      setInitialBoard(JSON.parse(JSON.stringify(board))); // Create a deep copy of the board
    } 
  }, [board]);
  
  const applyBoardUpdate = (newBoard: BeansBoard) => {
    const { valid, message, completed } = validateBoard(newBoard);
    setAlertState({ valid, message });
    if (completed) {
      puzzleComplete();
    }
    setPlayableBoard(newBoard);
  };

  const cycleCell = (rowIndex: number, colIndex: number) => {
    const newBoard = [...playableBoard];
    const clickedCell = newBoard[rowIndex][colIndex];

    if (!clickedCell.hasCross && !clickedCell.hasBean) {
      clickedCell.hasCross = true;
    } else if (clickedCell.hasCross && !clickedCell.hasBean) {
      clickedCell.hasCross = false;
      clickedCell.hasBean = true;
    } else {
      clickedCell.hasBean = false;
    }

    applyBoardUpdate(newBoard);
  };

  const addCrossIfEmpty = (rowIndex: number, colIndex: number) => {
    const cell = playableBoard[rowIndex][colIndex];
    if (cell.hasCross || cell.hasBean) return;

    const newBoard = [...playableBoard];
    newBoard[rowIndex][colIndex].hasCross = true;
    applyBoardUpdate(newBoard);
  };

  const getCellCoords = (target: EventTarget | null): [number, number] | null => {
    if (!(target instanceof Element)) return null;
    const cellEl = target.closest("[data-row][data-col]");
    if (!cellEl) return null;
    const row = Number(cellEl.getAttribute("data-row"));
    const col = Number(cellEl.getAttribute("data-col"));
    if (Number.isNaN(row) || Number.isNaN(col)) return null;
    return [row, col];
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const coords = getCellCoords(e.target);
    if (!coords) return;
    const [row, col] = coords;
    isDraggingRef.current = true;
    visitedRef.current = new Set([`${row}-${col}`]);
    cycleCell(row, col);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const coords = getCellCoords(el);
    if (!coords) return;
    const key = `${coords[0]}-${coords[1]}`;
    if (visitedRef.current.has(key)) return;
    visitedRef.current.add(key);
    addCrossIfEmpty(coords[0], coords[1]);
  };

  useEffect(() => {
    const endDrag = () => {
      isDraggingRef.current = false;
      visitedRef.current.clear();
    };
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, []);

  return (
    <div className="game-container">
      <div className="game-header">
        <TertiaryIconButton onClick={resetBoard} className="no-select">
          <img src={refreshIcon} alt="refresh" />
        </TertiaryIconButton>
        <h1 className="game-title">Beans {index ? `#${index}` : ""}</h1>
        <TertiaryIconButton onClick={skipPuzzle} className="no-select">
          <img src={forwardsIcon} alt="refresh" />
        </TertiaryIconButton>
      </div>
      <div className="game-timer">
        <img src={timerIcon} alt="timer" className="game-timer-icon"/>
        <div className="game-timer-text">
          {formatTimer(gameState.timer)}
        </div>
      </div>
      <div
        className="game-board bean"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        style={{ touchAction: "none" }}
      >
        <GameOverlay players={players} type="beans" gameState={gameState} startPuzzle={startPuzzle}/>
        {playableBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <BeansSquare key={`${rowIndex}-${colIndex}`} cell={cell} rowIndex={rowIndex} colIndex={colIndex} />
          ))
        )}
      </div>
      {alertState.message ? (
        <div
          className="game-alert"
          style={{
            backgroundColor: alertState.valid ? "#d4edda" : "#f8d7da",
            color: alertState.valid ? "#155724" : "#721c24",
            border: `1px solid ${alertState.valid ? "#c3e6cb" : "#f5c6cb"}`,
          }}
        >
          {alertState.message}
        </div>
      ) : (
        <div
          className="game-alert"
        >
        One bean per row, column and colour
        </div>
      )}
    </div>
  );
};

export default BeansGame;
