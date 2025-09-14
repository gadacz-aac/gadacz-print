import { Layer, Line, Rect, Stage, Transformer } from "react-konva";
import SymbolCard, { PreviewSymbol } from "./components/SymbolCard";
import Konva from "konva";
import { useEffect, useRef, useState, type Ref } from "react";
import PageBackground from "./components/PageBackground";
import usePageSize from "./hooks/usePageSize";
import { PointerTool, SymbolTool, TextTool } from "./consts/tools";
import useScale from "./hooks/useScale";
import { useAppStore } from "./store/store";
import useCursor from "./hooks/useCursor";
import TextElement from "./components/TextElement";
import { getClientRect } from "./helpers/konva";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

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
  stageRef: Ref<Konva.Stage>;
};

/**
 * In a perfect world we could use this property of transromer https://konvajs.org/api/Konva.Transformer.html#shouldOverdrawWholeArea
 * but this disables some events like dblClick on attached nodes
 *
 * IMPORTANT: Has to be placed before any items that will be attached to Transformer
 *
 * When elements are added to transformer this element should be resized
 */
function ShouldOverDrawWholeAreaHack({ ref }: { ref: Ref<Konva.Rect> }) {
  return <Rect draggable ref={ref} />;
}

const Whiteboard = ({ stageRef }: WhiteboardProps) => {
  const elements = useAppStore.use.elements();
  const isResizingNewlyAddedSymbol =
    useAppStore.use.isResizingNewlyAddedSymbol();
  const handleAddSymbolStart = useAppStore.use.handleAddSymbolStart();
  const handleAddSymbolResize = useAppStore.use.handleAddSymbolResize();
  const handleAddSymbolEnd = useAppStore.use.handleAddSymbolEnd();
  const handleTransformEnd = useAppStore.use.handleTransformEnd();
  const selectedIds = useAppStore.use.selectedIds();
  const selectionRectangle = useAppStore.use.selectionRectangle();
  const startSelectionRectangle = useAppStore.use.startSelectionRectangle();
  const resizeSelectionRectangle = useAppStore.use.resizeSelectionRectangle();
  const hideSelectionRectangle = useAppStore.use.hideSelectionRectangle();
  const handleStageClick = useAppStore.use.handleStageClick();
  const tool = useAppStore.use.tool();
  const setTool = useAppStore.use.setTool();
  const toolIsInProgress = useAppStore.use.toolIsInProgress();
  const setToolIsInProgress = useAppStore.use.setToolInProgress();
  const setPointerPosition = useAppStore.use.setPointerPosition();
  const numberOfPages = useAppStore.use.numberOfPages();
  const handleContextMenu = useAppStore.use.openContextMenu();

  const [guides, setGuides] = useState<GuideLine[]>([]);

  const transformerRef = useRef<Konva.Transformer>(null);
  const rectRefs = useRef<Map<string, Konva.Group>>(new Map());
  const overdrawWholeAreaRef = useRef<Konva.Rect>(null);

  const [pageWidth, pageHeight] = usePageSize();
  const scale = useScale();

  const showPreviewSymbol = tool === SymbolTool && !isResizingNewlyAddedSymbol;

  const [cursor] = useCursor();

  useEffect(() => {
    if (!transformerRef.current) return;
    if (!overdrawWholeAreaRef.current) return;

    if (!selectedIds.length) {
      transformerRef.current.nodes([]);
      overdrawWholeAreaRef.current.width(0);
      overdrawWholeAreaRef.current.height(0);
      return;
    }

    const nodes = selectedIds
      .map((id) => rectRefs.current.get(id))
      .filter((node) => node !== undefined);

    transformerRef.current.nodes([...nodes]);

    const { width, height } = transformerRef.current.__getNodeRect();

    // without this there's some funky behaviour when snapping
    // and really it looks similar to when every object was snapped separetly
    const padding = 10;
    overdrawWholeAreaRef.current.x(transformerRef.current.x() + padding / 2);
    overdrawWholeAreaRef.current.y(transformerRef.current.y() + padding / 2);
    overdrawWholeAreaRef.current.width(width - padding);
    overdrawWholeAreaRef.current.height(height - padding);

    // transformerRef.current.nodes([...nodes, overdrawWholeAreaRef.current]);
  }, [selectedIds, elements]);

  function handleStageMouseDown(evt: Konva.KonvaEventObject<MouseEvent>): void {
    switch (tool) {
      case SymbolTool:
      case TextTool:
        setToolIsInProgress(true);
        handleAddSymbolStart(evt, scale);
        break;
      case PointerTool:
        setToolIsInProgress(true);
        startSelectionRectangle(evt);
        break;
    }
  }

  function handleStageMouseMove(evt: Konva.KonvaEventObject<MouseEvent>) {
    const pos = evt.target.getStage()?.getPointerPosition();
    if (pos) setPointerPosition(pos);

    if (!toolIsInProgress) return;

    switch (tool) {
      case SymbolTool:
      case TextTool:
        handleAddSymbolResize(evt, scale);
        break;
      case PointerTool:
        resizeSelectionRectangle(evt);
        break;
    }
  }

  function handleStageMouseUp() {
    if (!toolIsInProgress) return;

    switch (tool) {
      case SymbolTool:
      case TextTool:
        setTool(PointerTool);
        handleAddSymbolEnd();
        break;
      case PointerTool:
        hideSelectionRectangle(scale);
        break;
    }

    setToolIsInProgress(false);
  }

  // were can we snap our objects?
  function getLineGuideStops(stage: Konva.Stage, skipShapes: Konva.Node[]) {
    // we can snap to stage borders and the center of the stage
    const vertical = [0, pageWidth / 2, pageWidth];
    const horizontal = [];

    for (let i = 0; i < numberOfPages + 1; i++) {
      horizontal.push(pageHeight * i, pageHeight * i + pageHeight / 2);
    }

    horizontal.push(pageHeight * (numberOfPages + 1));

    // and we snap over edges and center of each object on the canvas
    [...stage.find(".symbol"), ...stage.find(".text")].forEach((guideItem) => {
      if (skipShapes.includes(guideItem)) {
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
  function getObjectSnappingEdges(transformer: Konva.Transformer) {
    const trRect = transformer.__getNodeRect();
    const box = getClientRect({
      ...trRect,
      rotation: Konva.Util.radToDeg(trRect.rotation),
    });
    const absPos = transformer.getAbsolutePosition();

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
    if (e.target instanceof Konva.Stage) return;
    if (transformerRef.current === null) return;

    const stage = e.target.getStage();

    if (stage === null) return;

    // find possible snapping lines
    const lineGuideStops = getLineGuideStops(
      stage,
      transformerRef.current.nodes(),
    );

    // find snapping points of current object
    const itemBounds = getObjectSnappingEdges(transformerRef.current);

    // now find where can we snap current object
    const guides = getGuides(lineGuideStops, itemBounds);

    setGuides(guides);

    const trRect = transformerRef.current.__getNodeRect();
    const box = getClientRect({
      ...trRect,
      rotation: Konva.Util.radToDeg(trRect.rotation),
    });

    for (const e of transformerRef.current.nodes()) {
      if (e === overdrawWholeAreaRef.current) continue;

      const absPos = e.getAbsolutePosition();
      const nodeBox = e.getClientRect();
      // now force object position
      guides.forEach((lg) => {
        const axis = lg.orientation === "V" ? "x" : "y";

        const innerOffset = box[axis] - nodeBox[axis];

        absPos[axis] = lg.lineGuide + lg.offset - innerOffset;
      });

      e.absolutePosition(absPos);
    }

    overdrawWholeAreaRef.current?.absolutePosition(
      transformerRef.current.getAbsolutePosition(),
    );
  }

  function handleLayerDragEnd() {
    setGuides([]);
  }

  return (
    <OverlayScrollbarsComponent options={{ scrollbars: { autoHide: "move" } }}>
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
        onContextMenu={handleContextMenu}
      >
        <Layer>
          <PageBackground
            pageWidth={pageWidth}
            pageHeight={pageHeight}
            numberOfPages={numberOfPages}
          />
          <ShouldOverDrawWholeAreaHack ref={overdrawWholeAreaRef} />
          {elements.map((e) => {
            switch (e.name) {
              case "symbol":
                return (
                  <SymbolCard
                    key={e.id}
                    symbol={e}
                    // onTransformEnd={handleTransformEnd}
                    ref={(node) => {
                      if (node) {
                        rectRefs.current.set(e.id, node);
                      }
                    }}
                  />
                );
              case "text":
                return (
                  <TextElement
                    key={e.id}
                    text={e}
                    // onTransformEnd={handleTransformEnd}
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
            onDragMove={handleLayerDragMove}
            onDragEnd={handleLayerDragEnd}
            anchorStyleFunc={(anchor) => {
              if (anchor.hasName("rotator")) {
                anchor.position({ x: 1, y: 1 });
              }
            }}
            onTransformEnd={() => {
              if (transformerRef.current !== null)
                handleTransformEnd(transformerRef.current);
            }}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />

          {showPreviewSymbol && <PreviewSymbol />}

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
    </OverlayScrollbarsComponent>
  );
};

export default Whiteboard;
