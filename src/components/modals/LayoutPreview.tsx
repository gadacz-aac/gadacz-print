import { Stage, Layer, Rect } from "react-konva";
import { type CommunicationSymbol } from "../../types";
import usePageSize from "../../hooks/usePageSize";

interface LayoutPreviewProps {
  layout: CommunicationSymbol[];
  width: number;
  height: number;
}

const LayoutPreview = ({ layout, width, height }: LayoutPreviewProps) => {
  const [pageWidth] = usePageSize();

  const scale = width / pageWidth;

  return (
    <Stage width={width} height={height}>
      <Layer>
        {layout.map((symbol) => (
          <Rect
            key={symbol.id}
            x={symbol.x * scale}
            y={symbol.y * scale}
            width={symbol.width * scale}
            height={symbol.height * scale}
            fill="gray"
            stroke="black"
            strokeWidth={1}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default LayoutPreview;
