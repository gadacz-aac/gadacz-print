import { Group, Image, Rect } from "react-konva";
import type { CommunicationSymbol } from "../App";
import type Konva from "konva";
import useImage from "use-image";
import { useEffect, useState } from "react";

type SymbolCardProps = {
  symbol: CommunicationSymbol;
  isSelected: boolean;
  ref: React.Ref<Konva.Group>;
  onTransformEnd: (evt: Konva.KonvaEventObject<Event>) => void;
  onDragEnd: (evt: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  onClick: (evt: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
};

const SymbolCard = ({
  symbol,
  isSelected,
  ref,
  onDragEnd,
  onTransformEnd,
  onClick,
}: SymbolCardProps) => {
  const [background] = useImage(symbol.image ?? "");

  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);

  useEffect(() => {
    if (background) {
      setImage(background);
    }
  }, [background]);

  return (
    <Group
      id={symbol.id}
      name={symbol.name}
      x={symbol.x}
      y={symbol.y}
      draggable
      onDragEnd={(e) => onDragEnd(e, symbol.id)}
      onClick={(e) => onClick(e, symbol.id)}
      onTransformEnd={onTransformEnd}
      ref={ref}
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
