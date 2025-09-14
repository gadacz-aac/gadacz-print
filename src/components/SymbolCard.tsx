import { Group, Image, Rect, Text } from "react-konva";
import type Konva from "konva";
import useImage from "use-image";
import { useEffect, useRef, useState } from "react";
import type { CommunicationSymbol } from "../types";
import useScale, { type Scale } from "../hooks/useScale";
import { useAppStore } from "../store/store";
import { isEmpty } from "../helpers/helpers";

export function PreviewSymbol() {
  const brushData = useAppStore.use.brushData();
  const scale = useScale();
  const pointerPosition = useAppStore.use.pointerPosition();

  return (
    <Rect
      x={pointerPosition.x}
      y={pointerPosition.y}
      rotation={0}
      opacity={0.2}
      width={brushData.width * scale.WidthToA4}
      height={brushData.height * scale.WidthToA4}
      fill={brushData.backgroundColor}
      strokeWidth={brushData.strokeWidth}
      cornerRadius={brushData.borderRadius}
      stroke={brushData.stroke}
    />
  );
}

type SymbolCardProps = {
  symbol: CommunicationSymbol;
  ref: React.Ref<Konva.Group>;
  onTransformEnd?: (
    evt: Konva.KonvaEventObject<Event>,
    id: string,
    scale: Scale,
  ) => void;
  onDragEnd?: (evt: Konva.KonvaEventObject<DragEvent>) => void;
  onMouseOver?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseOut?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
};

const SymbolCard = ({
  symbol,
  ref,
  onDragEnd,
  onTransformEnd,
  onMouseOut,
  onMouseOver,
}: SymbolCardProps) => {
  const textRef = useRef<Konva.Text>(null);

  const [background] = useImage(symbol.image ?? "", "anonymous");

  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);

  const scale = useScale();
  const [textHeight, setTextHeight] = useState(0);
  const handleMouseDown = useAppStore.use.handleMouseDown();
  const handleDragEnd = useAppStore.use.handleDragEnd();

  useEffect(() => {
    if (background) {
      setImage(background);
    }
  }, [background]);

  function handleTextHeightChange() {
    setTextHeight(textRef.current?.height() ?? 0);
  }

  useEffect(() => {
    handleTextHeightChange();
  }, [symbol]);

  useEffect(() => {
    window.addEventListener("resize", handleTextHeightChange);

    console.log(textRef.current?.height());

    return () => window.removeEventListener("resize", handleTextHeightChange);
  }, []);

  const width = Math.abs(symbol.width) * scale.WidthToA4;
  const height = Math.abs(symbol.height) * scale.WidthToA4;

  const x = symbol.x * scale.WidthToA4;
  const y = symbol.y * scale.WidthToA4;

  const paddingY = symbol.paddingY * scale.WidthToA4;
  const paddingX = symbol.paddingX * scale.WidthToA4;

  const imageOffet =
    symbol.textOverImage || isEmpty(symbol.text) ? 0 : -textHeight;
  const imageHeight = height - paddingY * 2 + imageOffet;
  const imageWidth = width - paddingX * 2 + imageOffet;

  return (
    <Group
      name={symbol.name}
      id={symbol.id}
      x={x}
      y={y}
      draggable
      onDragEnd={(e) => {
        handleDragEnd(e, symbol.id, scale);
        onDragEnd?.(e);
      }}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onTransformEnd={(e) => onTransformEnd?.(e, symbol.id, scale)}
      onMouseDown={(evt) => handleMouseDown(evt, symbol.id)}
      ref={ref}
      scaleX={symbol.width < 0 ? -1 : 1}
      scaleY={symbol.height < 0 ? -1 : 1}
    >
      <Rect
        width={width}
        height={height}
        fill={symbol.backgroundColor}
        cornerRadius={symbol.borderRadius}
        strokeWidth={symbol.strokeWidth}
        stroke={symbol.stroke}
        strokeScaleEnabled={false}
      />
      <Group offsetX={-paddingX} offsetY={-paddingY}>
        <Image
          offsetY={imageOffet}
          offsetX={imageOffet / 2}
          width={imageWidth}
          height={imageHeight}
          image={image}
        />
        <Text
          width={width - paddingX * 2}
          ref={textRef}
          align="center"
          fill={symbol.fontColor}
          fontStyle={symbol.fontStyle}
          fontFamily={symbol.fontFamily}
          fontSize={symbol.fontSize * scale.WidthToA4}
          text={symbol.text}
          lineHeight={symbol.lineHeight}
          letterSpacing={symbol.letterSpacing}
        />
      </Group>
    </Group>
  );
};

export default SymbolCard;
