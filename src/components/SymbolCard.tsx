import { Group, Image, Rect, Text } from "react-konva";
import type Konva from "konva";
import useImage from "use-image";
import { useEffect, useState } from "react";
import type { CommunicationSymbol } from "../types";
import useScale from "../hooks/useScale";

type SymbolCardProps = {
  symbol: CommunicationSymbol;
  ref: React.Ref<Konva.Group>;
  onTransformEnd: (evt: Konva.KonvaEventObject<Event>) => void;
  onDragEnd: (evt: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  onClick: (evt: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onMouseOver: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseOut: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
};

const SymbolCard = ({
  symbol,
  ref,
  onDragEnd,
  onTransformEnd,
  onClick,
  onMouseOut,
  onMouseOver,
}: SymbolCardProps) => {
  const [background] = useImage(symbol.image ?? "", "anonymous");

  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const { WidthToA4: scale } = useScale();

  useEffect(() => {
    if (background) {
      setImage(background);
    }
  }, [background]);

  const width = symbol.width * scale;
  const height = symbol.height * scale;

  const x = symbol.x * scale;
  const y = symbol.y * scale;

  return (
    <Group
      id={symbol.id}
      name={symbol.name}
      x={x}
      y={y}
      draggable
      onDragEnd={(e) => onDragEnd(e, symbol.id)}
      onClick={(e) => onClick(e, symbol.id)}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onTransformEnd={onTransformEnd}
      ref={ref}
    >
      <Rect
        width={width}
        height={height}
        fill={symbol.backgroundColor}
        strokeWidth={symbol.strokeWidth}
        stroke={symbol.stroke}
      />
      <Image
        offsetX={-15}
        offsetY={-25}
        width={width - 30}
        height={height - 30}
        image={image}
      />
      <Text
        offsetY={-2}
        width={width}
        align="center"
        fontStyle={symbol.fontStyle}
        fontSize={symbol.fontSize * scale}
        text={symbol.text}
        lineHeight={symbol.lineHeight}
        letterSpacing={symbol.letterSpacing}
      />
    </Group>
  );
};

export default SymbolCard;
