import { Rect } from "react-konva"
import type { CommunicationSymbol } from "../App";
import type Konva from "konva";

type SymbolCardProps = {
  symbol: CommunicationSymbol;
  onDragEnd: (evt: Konva.KonvaEventObject<DragEvent>) => void;
}

const SymbolCard = ({ symbol, onDragEnd }: SymbolCardProps) => {

  return (
    <Rect
      id={symbol.id}
      draggable
      strokeWidth={1}
      stroke={"white"}
      width={50}
      height={50}
      x={symbol.x}
      y={symbol.y}
      onDragEnd={onDragEnd}
    />
  )
}

export default SymbolCard;
