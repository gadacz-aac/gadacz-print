import { Group, Image, Rect, Text } from "react-konva";
import type Konva from "konva";
import useImage from "use-image";
import { useEffect, useState } from "react";
import type { CommunicationSymbol } from "../types";
import useScale, { type Scale } from "../hooks/useScale";

type SymbolCardProps = {
  symbol: CommunicationSymbol;
  ref: React.Ref<Konva.Group>;
  onTransformEnd: (
    evt: Konva.KonvaEventObject<Event>,
    id: string,
    scale: Scale,
  ) => void;
  onDragEnd: (
    evt: Konva.KonvaEventObject<DragEvent>,
    id: string,
    scale: Scale,
  ) => void;
  onMouseOver: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseOut: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onClick: (evt: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
};

const SymbolCard = ({
  symbol,
  ref,
  onDragEnd,
  onTransformEnd,
  onMouseOut,
  onClick,
  onMouseOver,
}: SymbolCardProps) => {
  const [background] = useImage(symbol.image ?? "", "anonymous");

  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const scale = useScale();

  useEffect(() => {
    if (background) {
      setImage(background);
    }
  }, [background]);

  const width = symbol.width * scale.WidthToA4;
  const height = symbol.height * scale.WidthToA4;

  const x = symbol.x * scale.WidthToA4;
  const y = symbol.y * scale.WidthToA4;

  return (
    <Group
      name={symbol.name}
      x={x}
      y={y}
      draggable
      onDragEnd={(e) => onDragEnd(e, symbol.id, scale)}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onTransformEnd={(e) => onTransformEnd(e, symbol.id, scale)}
      onClick={(evt) => onClick(evt, symbol.id)}
      ref={ref}
    >
      <Rect
        id={symbol.id}
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
        fontSize={symbol.fontSize * scale.WidthToA4}
        text={symbol.text}
        lineHeight={symbol.lineHeight}
        letterSpacing={symbol.letterSpacing}
      />
    </Group>
  );
};

export default SymbolCard;
