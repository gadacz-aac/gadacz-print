import { Layer, Line, Rect, Stage, Transformer } from "react-konva";
import SymbolCard from "./components/SymbolCard";
import Konva from "konva";
import { useEffect, useRef, useState, type Ref } from "react";
import PageBackground from "./components/PageBackground";
import usePageSize from "./hooks/usePageSize";
import { PointerTool, SymbolTool } from "./consts/tools";
import useScale from "./hooks/useScale";
import { useAppStore } from "./store/store";
import useCursor from "./hooks/useCursor";

type Snap = "center" | "end" | "start";

type GuideLine = {
  lineGuide: number;
  offset: number;
  orientation: "H" | "V";
  snap: Snap;
};

type ObjectSnappingEdge = {
  guide: number;
  offset: number;
  snap: Snap;
};
const GUIDELINE_OFFSET = 5;

type WhiteboardProps = {
  numberOfPages: number;
  stageRef: Ref<Konva.Stage>;
};

const Whiteboard = ({ numberOfPages, stageRef }: WhiteboardProps) => {
  const elements = useAppStore.use.elements();
  const isResizingNewlyAddedSymbol =
    useAppStore.use.isResizingNewlyAddedSymbol();
  const brushData = useAppStore.use.brushData();
  const handleAddSymbolStart = useAppStore.use.handleAddSymbolStart();
  const handleAddSymbolResize = useAppStore.use.handleAddSymbolResize();
  const handleAddSymbolEnd = useAppStore.use.handleAddSymbolEnd();
  const handleDragEnd = useAppStore.use.handleDragEnd();
  const handleTransformEnd = useAppStore.use.handleTransformEnd();
  const selectedIds = useAppStore.use.selectedIds();
  const selectionRectangle = useAppStore.use.selectionRectangle();
  const startSelectionRectangle = useAppStore.use.startSelectionRectangle();
  const resizeSelectionRectangle = useAppStore.use.resizeSelectionRectangle();
  const handleElementClick = useAppStore.use.handleElementClick();
  const hideSelectionRectangle = useAppStore.use.hideSelectionRectangle();
  const handleStageClick = useAppStore.use.handleStageClick();
  const tool = useAppStore.use.tool();
  const setTool = useAppStore.use.setTool();

  const [guides, setGuides] = useState<GuideLine[]>([]);

  const transformerRef = useRef<Konva.Transformer>(null);
  const rectRefs = useRef<Map<string, Konva.Group>>(new Map());

  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });
  const isAddingSymbol = useRef(false);
  const isSelecting = useRef(false);

  const [pageWidth, pageHeight] = usePageSize();
  const scale = useScale();

  const showPreviewSymbol = tool === SymbolTool && !isResizingNewlyAddedSymbol;

  const [cursor, setCursor] = useCursor();

  useEffect(() => {
    if (!transformerRef.current) return;

    if (!selectedIds.length) {
      transformerRef.current.nodes([]);
      return;
    }

    const nodes = selectedIds
      .map((id) => rectRefs.current.get(id))
      .filter((node) => node !== undefined);

    transformerRef.current.nodes(nodes);
  }, [selectedIds, elements]);

  function handleStageMouseDown(evt: Konva.KonvaEventObject<MouseEvent>): void {
    switch (tool) {
      case SymbolTool:
        isAddingSymbol.current = true;
        handleAddSymbolStart(evt, scale);
        break;
      case PointerTool:
        isSelecting.current = true;
        startSelectionRectangle(evt);
        break;
    }
  }

  function handleStageMouseMove(evt: Konva.KonvaEventObject<MouseEvent>) {
    const pos = evt.target.getStage()?.getPointerPosition();
    if (pos) setPointerPosition(pos);

    if (isAddingSymbol.current) {
      handleAddSymbolResize(evt, scale);
    } else if (isSelecting.current) {
      resizeSelectionRectangle(evt);
    }
  }

  function handleStageMouseUp() {
    if (isAddingSymbol.current) {
      isAddingSymbol.current = false;
      setTool(PointerTool);
      handleAddSymbolEnd();
    } else if (isSelecting.current) {
      isSelecting.current = false;

      hideSelectionRectangle(scale);
    }
  }

  // were can we snap our objects?
  function getLineGuideStops(stage: Konva.Stage, skipShape: Konva.Shape) {
    // we can snap to stage borders and the center of the stage
    const vertical = [0, pageWidth / 2, pageWidth];
    const horizontal = [0, pageHeight / 2, pageHeight];

    // and we snap over edges and center of each object on the canvas
    stage.find(".symbol").forEach((guideItem) => {
      if (guideItem === skipShape) {
        return;
      }
      const box = guideItem.getClientRect();
      // and we can snap to all edges of shapes
      vertical.push(box.x, box.x + box.width, box.x + box.width / 2);
      horizontal.push(box.y, box.y + box.height, box.y + box.height / 2);
    });

    return {
      vertical: vertical,
      horizontal: horizontal,
    };
  }

  // what points of the object will trigger to snapping?
  // it can be just center of the object
  // but we will enable all edges and center
  function getObjectSnappingEdges(node: Konva.Shape) {
    const box = node.getClientRect();
    const absPos = node.absolutePosition();

    return {
      vertical: [
        {
          guide: Math.round(box.x),
          offset: Math.round(absPos.x - box.x),
          snap: "start",
        },
        {
          guide: Math.round(box.x + box.width / 2),
          offset: Math.round(absPos.x - box.x - box.width / 2),
          snap: "center",
        },
        {
          guide: Math.round(box.x + box.width),
          offset: Math.round(absPos.x - box.x - box.width),
          snap: "end",
        },
      ],
      horizontal: [
        {
          guide: Math.round(box.y),
          offset: Math.round(absPos.y - box.y),
          snap: "start",
        },
        {
          guide: Math.round(box.y + box.height / 2),
          offset: Math.round(absPos.y - box.y - box.height / 2),
          snap: "center",
        },
        {
          guide: Math.round(box.y + box.height),
          offset: Math.round(absPos.y - box.y - box.height),
          snap: "end",
        },
      ],
    } satisfies {
      vertical: ObjectSnappingEdge[];
      horizontal: ObjectSnappingEdge[];
    };
  }

  // find all snapping possibilities
  function getGuides(
    lineGuideStops: ReturnType<typeof getLineGuideStops>,
    itemBounds: ReturnType<typeof getObjectSnappingEdges>,
  ) {
    let minV: GuideLine | null = null;
    let minH: GuideLine | null = null;

    const minVDiff: number | null = null;
    const minHDiff: number | null = null;

    lineGuideStops.vertical.forEach((lineGuide) => {
      itemBounds.vertical.forEach((itemBound) => {
        const diff = Math.abs(lineGuide - itemBound.guide);
        // if the distance between guild line and object snap point is close we can consider this for snapping
        if (diff >= GUIDELINE_OFFSET) return;
        if (minVDiff !== null && diff > minVDiff) return;

        minV = {
          lineGuide: lineGuide,
          offset: itemBound.offset,
          orientation: "V",
          snap: itemBound.snap,
        };
      });
    });

    lineGuideStops.horizontal.forEach((lineGuide) => {
      itemBounds.horizontal.forEach((itemBound) => {
        const diff = Math.abs(lineGuide - itemBound.guide);
        if (diff >= GUIDELINE_OFFSET) return;
        if (minHDiff !== null && diff > minHDiff) return;
        minH = {
          lineGuide: lineGuide,
          orientation: "H",
          snap: itemBound.snap,
          offset: itemBound.offset,
        };
      });
    });

    const guides: GuideLine[] = [];

    if (minV) guides.push(minV);
    if (minH) guides.push(minH);

    return guides;
  }

  function handleLayerDragMove(e: Konva.KonvaEventObject<DragEvent>) {
    // clear all previous lines on the screen
    // layer.find(".guid-line").forEach((l) => l.destroy());

    if (e.target instanceof Konva.Stage) return;

    const stage = e.target.getStage();

    if (stage === null) return;

    // find possible snapping lines
    const lineGuideStops = getLineGuideStops(stage, e.target);
    // find snapping points of current object
    const itemBounds = getObjectSnappingEdges(e.target);

    // now find where can we snap current object
    const guides = getGuides(lineGuideStops, itemBounds);

    setGuides(guides);

    const absPos = e.target.absolutePosition();
    // now force object position
    guides.forEach((lg) => {
      switch (lg.orientation) {
        case "V": {
          absPos.x = lg.lineGuide + lg.offset;
          break;
        }
        case "H": {
          absPos.y = lg.lineGuide + lg.offset;
          break;
        }
      }
    });
    e.target.absolutePosition(absPos);
  }

  function handleLayerDragEnd() {
    setGuides([]);
  }

  return (
    <Stage
      ref={stageRef}
      width={pageWidth}
      height={pageHeight * numberOfPages}
      style={{
        cursor,
        display: "flex",
        justifyContent: "center",
      }}
      onMouseDown={handleStageMouseDown}
      onMouseMove={handleStageMouseMove}
      onMouseUp={handleStageMouseUp}
      onClick={handleStageClick}
    >
      <Layer onDragMove={handleLayerDragMove} onDragEnd={handleLayerDragEnd}>
        <PageBackground
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          numberOfPages={numberOfPages}
        />

        {elements.map((e) => {
          switch (e.name) {
            case "symbol":
              return (
                <SymbolCard
                  key={e.id}
                  symbol={e}
                  onDragEnd={handleDragEnd}
                  onTransformEnd={handleTransformEnd}
                  onMouseOver={() => setCursor("move")}
                  onMouseOut={() => setCursor("default")}
                  onClick={handleElementClick}
                  ref={(node) => {
                    if (node) {
                      rectRefs.current.set(e.id, node);
                    }
                  }}
                />
              );
          }
        })}

        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />

        {showPreviewSymbol && (
          <Rect
            x={pointerPosition.x}
            y={pointerPosition.y}
            rotation={0}
            opacity={0.2}
            width={brushData.width * scale.WidthToA4}
            height={brushData.height * scale.WidthToA4}
            fill={brushData.backgroundColor}
            strokeWidth={brushData.strokeWidth}
            stroke={brushData.stroke}
          />
        )}

        {selectionRectangle.visible && (
          <Rect
            x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
            y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
            width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
            height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
            fill="rgba(0,0,255,0.5)"
          />
        )}

        {guides.map((lg) => {
          const data =
            lg.orientation === "H"
              ? {
                  points: [-6000, 0, 6000, 0],
                  x: 0,
                  y: lg.lineGuide,
                }
              : {
                  points: [0, -6000, 0, 6000],
                  x: lg.lineGuide,
                  y: 0,
                };

          return (
            <Line
              key={lg.orientation + lg.lineGuide}
              {...data}
              stroke="rgb(0, 161, 255)"
              strokeWidth={1}
              name="guid-line"
              dash={[4, 6]}
            />
          );
        })}
      </Layer>
    </Stage>
  );
};

export default Whiteboard;
