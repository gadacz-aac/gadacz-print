import { Group, Image, Rect } from "react-konva";
import type { CommunicationSymbol } from "../App";
import type Konva from "konva";
import useImage from "use-image";
import { useEffect, useState } from "react";

type SymbolCardProps = {
  symbol: CommunicationSymbol;
  isSelected: boolean;
  onDragEnd: (evt: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  onClick: (evt: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
};

const SymbolCard = ({
  symbol,
  isSelected,
  onDragEnd,
  onClick,
}: SymbolCardProps) => {
  const [background] = symbol.image ? useImage(symbol.image) : [null];

  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);

  useEffect(() => {
    if (background) {
      setImage(background);
    }
  }, [background]);

  return (
    <Group
      x={symbol.x}
      y={symbol.y}
      draggable
      onDragEnd={(e) => onDragEnd(e, symbol.id)}
      onClick={(e) => onClick(e, symbol.id)}
      la
    >
      {isSelected && (
        <Rect
          offsetY={4}
          offsetX={4}
          width={symbol.width + 8}
          height={symbol.height + 8}
          strokeWidth={1}
          stroke="white"
        />
      )}

      <Rect
        width={symbol.width}
        height={symbol.height}
        fill={symbol.backgroundColor}
        strokeWidth={symbol.strokeWidth}
        stroke={symbol.stroke}
      />
      <Image width={symbol.width} height={symbol.height} image={image} />
    </Group>
  );
};

export default SymbolCard;
