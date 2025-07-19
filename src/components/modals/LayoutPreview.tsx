import { Stage, Layer, Rect } from "react-konva";
import { type CommunicationSymbol } from "../../types";
import { A4 } from "../../consts/page_format";

interface LayoutPreviewProps {
  layout: CommunicationSymbol[];
  width: number;
  height: number;
}

const LayoutPreview = ({ layout, width, height }: LayoutPreviewProps) => {
  const scale = width / A4.landscape.width;

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
