import { Layer, Line, Rect, Stage, Transformer } from "react-konva";
import SymbolCard from "./components/SymbolCard";
import Konva from "konva";
import React, { useEffect, useRef, useState, type ChangeEvent } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Toolbar from "./components/Toolbar";
import type * as CSS from "csstype";
import { KeyCode } from "./consts/key_codes";
import { useSymbols } from "./hooks/useSymbols";
import { useSelection } from "./hooks/useSelection";
import jsPDF from "jspdf";
import { A4 } from "./consts/page_format";
import { isStage } from "./helpers/konva";
import PageBackground, { PageBreakName } from "./components/PageBackground";
import styles from "./App.module.css";

import PredefinedLayoutsModal from "./components/modals/PredefinedLayoutsModal";
import usePageSize from "./hooks/usePageSize";
import { defaultHeight, defaultWidth } from "./consts/symbol";
import { PointerTool, SymbolTool, type Tool } from "./consts/tools";
import { extension } from "./consts/extension";
import { type CommunicationSymbol } from "./types";
import { randomFromRange } from "./helpers/random";
import { useTranslation } from "react-i18next";

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

const App = () => {
  const {
    symbols,
    isResizingNewlyAddedSymbol,
    brushData,
    setBrushData,
    setSymbols,
    addSymbols,
    handleAddSymbolStart,
    handleAddSymbolResize,
    handleAddSymbolEnd,
    handleDragEnd,
    handleDeleteSelectedSymbol,
    styleSelectedSymbols,
    handleTransformEnd,
  } = useSymbols();

  const {
    selectedIds,
    setSelectedIds,
    selectionRectangle,
    handleSelect,
    startSelectionRectangle,
    resizeSelectionRectangle,
    hideSelectionRectangle,
    handleStageClick,
  } = useSelection();

  const [guides, setGuides] = useState<GuideLine[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const rectRefs = useRef<Map<string, Konva.Group>>(new Map());

  const [cursor, setCursor] = useState<CSS.Property.Cursor>("default");
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [isLayoutsModalOpen, setIsLayoutsModalOpen] = useState(false);
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>(PointerTool);
  const isAddingSymbol = useRef(false);
  const isSelecting = useRef(false);

  const [pageWidth, pageHeight, sidebarWidth] = usePageSize();

  const { t } = useTranslation();

  const showPreviewSymbol = tool === SymbolTool && !isResizingNewlyAddedSymbol;
  const [copiedSymbols, setCopiedSymbols] = useState<CommunicationSymbol[]>([]);

  useEffect(() => {
    setCursor(tool.cursor);
  }, [tool]);

  useEffect(() => {
    containerRef?.current?.focus();
  }, []);

  function setCursorIfDefault(cursor: CSS.Property.Cursor) {
    if (tool === PointerTool) {
      setCursor(cursor);
    }
  }

  useEffect(() => {}, [brushData, selectedIds, symbols]);

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
  }, [selectedIds, symbols]);

  function handleSymbolCopy() {
    const dx = randomFromRange(-10, 10);
    const dy = randomFromRange(-10, 10);
    setCopiedSymbols(
      symbols
        .filter((e) => selectedIds.includes(e.id))
        .map((e) => ({
          ...e,
          width: e.width,
          height: e.height,
          x: e.x + dx,
          y: e.y + dy,
        })),
    );
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (evt) => {
    if (evt.ctrlKey) {
      switch (evt.key) {
        case KeyCode.C:
          handleSymbolCopy();
          break;
        case KeyCode.V:
          addSymbols(copiedSymbols, (e) => setSelectedIds(e.map((e) => e.id)));
          break;
        case KeyCode.A:
          setSelectedIds(symbols.map((e) => e.id));
          break;
        default:
          return;
      }

      return;
    }

    switch (evt.key) {
      case KeyCode.Delete:
        handleDeleteSelectedSymbol(selectedIds);
        setSelectedIds([]);
        break;
      default:
        return;
    }
    evt.preventDefault();
  };

  function handleStageMouseDown(evt: Konva.KonvaEventObject<MouseEvent>): void {
    if (isStage(evt)) {
      return;
    }

    if (SymbolTool === tool) {
      isAddingSymbol.current = true;
      handleAddSymbolStart(evt);
    } else {
      isSelecting.current = true;
      startSelectionRectangle(evt);
    }
  }

  function handleStageMouseMove(evt: Konva.KonvaEventObject<MouseEvent>) {
    const pos = evt.target.getStage()?.getPointerPosition();
    if (pos) setPointerPosition(pos);

    if (isAddingSymbol.current) {
      handleAddSymbolResize(evt);
    } else if (isSelecting.current) {
      resizeSelectionRectangle(evt);
    }
  }

  function handleStageMouseUp(evt: Konva.KonvaEventObject<MouseEvent>) {
    if (isAddingSymbol.current) {
      isAddingSymbol.current = false;
      setTool(PointerTool);
      handleAddSymbolEnd(evt, setSelectedIds);
    } else if (isSelecting.current) {
      isSelecting.current = false;

      hideSelectionRectangle(symbols);
    }
  }

  function handleDownload(): void {
    const A4Width = A4.landscape.width;
    const A4Height = A4.landscape.height;

    const pdf = new jsPDF("l", "px", [A4Width, A4Height]);

    const stage = stageRef.current;
    if (!stage) return;

    const hideTemporarly = [
      ...stage.find(`.${PageBreakName}`),
      ...stage.find("Transformer"),
    ];
    hideTemporarly.forEach((e) => e.hide());

    for (let i = 0; i < numberOfPages; i++) {
      pdf.addImage(
        stage.toDataURL({
          pixelRatio: 2,
          x: 0,
          y: i * pageHeight,
          width: pageWidth,
          height: pageHeight,
        }),
        0,
        0,
        A4Width,
        A4Height,
      );

      if (i !== numberOfPages - 1) {
        pdf.addPage([A4Width, A4Height], "l");
      }
    }

    pdf.save(`canvas.${extension}`);
    hideTemporarly.forEach((e) => e.show());
  }

  function onSave() {
    const text = JSON.stringify({ symbols, numberOfPages });

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text),
    );
    element.setAttribute("download", `board${extension}`);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  function onOpen(evt: ChangeEvent<HTMLInputElement>) {
    evt.preventDefault();
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result;

      if (typeof text !== "string") {
        return alert("Invalid file");
      }

      try {
        const state = await JSON.parse(text);

        setSymbols(state["symbols"]);
        setNumberOfPages(state["numberOfPages"]);
      } catch {
        return alert(t("Text"));
      }
    };

    if (!evt.target.files) {
      alert(t("No file was selected"));
    }

    reader.readAsText(evt.target.files![0]);
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
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={styles.container}
    >
      <div className={styles.sidebar} style={{ width: sidebarWidth }}>
        <Sidebar
          brushData={brushData}
          selectedSymbols={symbols.filter((e) => selectedIds.includes(e.id))}
          onStyleChange={(property, value) => {
            if (selectedIds.length) {
              return styleSelectedSymbols(selectedIds, property, value);
            }

            if (property === "image" && typeof value === "string") {
              addSymbols([
                {
                  ...brushData,
                  image: value,
                  width: defaultWidth,
                  height: defaultHeight,
                  x: 0,
                  y: 0,
                  rotation: 0,
                  name: "symbol",
                },
              ]);
              return;
            }

            setBrushData(property, value);
          }}
        />
      </div>
      <div className={styles.toolbar} style={{ translate: sidebarWidth / 2 }}>
        <Toolbar
          tool={tool}
          onPointer={() => setTool(PointerTool)}
          onAddSymbol={() => setTool(SymbolTool)}
          onDownload={handleDownload}
          insertPageBreak={() => setNumberOfPages((prev) => prev + 1)}
          openLayoutsModal={() => setIsLayoutsModalOpen(true)}
          onSave={onSave}
          onOpen={onOpen}
        />
      </div>
      <PredefinedLayoutsModal
        isOpen={isLayoutsModalOpen}
        onClose={() => setIsLayoutsModalOpen(false)}
        onSelectLayout={(layout) => {
          addSymbols(layout);
          setIsLayoutsModalOpen(false);
        }}
      />
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
        onClick={(evt) => handleStageClick(evt)}
      >
        <Layer onDragMove={handleLayerDragMove} onDragEnd={handleLayerDragEnd}>
          <PageBackground
            pageWidth={pageWidth}
            pageHeight={pageHeight}
            numberOfPages={numberOfPages}
          />

          {symbols.map((e) => (
            <SymbolCard
              key={e.id}
              symbol={e}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
              onClick={handleSelect}
              onMouseOver={() => setCursorIfDefault("move")}
              onMouseOut={() => setCursorIfDefault("default")}
              ref={(node) => {
                if (node) {
                  rectRefs.current.set(e.id, node);
                }
              }}
            />
          ))}

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
              width={brushData.width}
              height={brushData.height}
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
    </div>
  );
};

export default App;
