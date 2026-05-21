import { BeansCell } from "@utils/types";
import beanIcon from "/src/assets/bean.svg";
import crossIcon from "/src/assets/tiny-cross.svg";

interface BeansSquareProps {
  cell: BeansCell;
  rowIndex: number;
  colIndex: number;
}


const BeansSquare = ({ cell, rowIndex, colIndex }: BeansSquareProps) => {

  return (
    <div
      key={`${rowIndex}-${colIndex}`}
      data-row={rowIndex}
      data-col={colIndex}
      className="game-cell bean"
      style={{
        backgroundColor: cell.color || "#000",
        borderBottom: rowIndex === 9 ? "1px solid #000" : "none",
        borderRight: colIndex === 9 ? "1px solid #000" : "none",
        borderTopRightRadius: rowIndex === 0 && colIndex === 9 ? "5px" : "0",
        borderBottomRightRadius: rowIndex === 9 && colIndex === 9 ? "5px" : "0",
        borderTopLeftRadius: rowIndex === 0 && colIndex === 0 ? "5px" : "0",
        borderBottomLeftRadius: rowIndex === 9 && colIndex === 0 ? "5px" : "0",
      }}
    >
      {cell.hasCross && (
        <div
          className="cell-marker"
        >
          <img className="cell-img" src={crossIcon}></img>
        </div>
      )}
      {cell.hasBean && (
        <div
          className="cell-marker"
        >
          <img className="cell-img" src={beanIcon}></img>
        </div>
      )}
    </div>
  );
};

export default BeansSquare;