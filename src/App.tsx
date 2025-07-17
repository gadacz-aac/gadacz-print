import { Layer, Rect, Stage, Transformer } from "react-konva";
import SymbolCard from "./components/SymbolCard";
import Konva from "konva";
import React, { useEffect, useRef, useState, type ChangeEvent } from "react";
import Sidebar from "./components/Sidebar";
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

const App = () => {
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

  const [pageWidth, pageHeight] = usePageSize();

  const {
    symbols,
    isResizingNewlyAddedSymbol,
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

  const showPreviewSymbol =
    cursor === "crosshair" && !isResizingNewlyAddedSymbol;

  useEffect(() => {
    setCursor(tool.cursor);
  }, [tool]);

  useEffect(() => {
    containerRef?.current?.focus();
  }, []);

  function setCursorIfDefault(cursor: CSS.Property.Cursor) {
    if (tool === PointerTool) setCursor(cursor);
  }

  useEffect(() => {
    if (!transformerRef.current) return;

    transformerRef.current.padding(4);

    if (!selectedIds.length) {
      transformerRef.current.nodes([]);
      return;
    }

    const nodes = selectedIds
      .map((id) => rectRefs.current.get(id))
      .filter((node) => node !== undefined);

    transformerRef.current.nodes(nodes);
  }, [selectedIds, symbols]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (evt) => {
    switch (evt.key) {
      case KeyCode.Delete:
        handleDeleteSelectedSymbol(selectedIds);
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

    if (cursor === "crosshair") {
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

  function handleStageMouseUp() {
    if (isAddingSymbol.current) {
      isAddingSymbol.current = false;
      setTool(PointerTool);
      handleAddSymbolEnd(setSelectedIds);
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
    element.setAttribute("download", "board.gpb");

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
        return alert("Invalid file");
      }
    };

    if (!evt.target.files) {
      alert("No file was selected");
    }

    reader.readAsText(evt.target.files![0]);
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={styles.container}
    >
      {selectedIds.length > 0 && (
        <Sidebar
          onStyleChange={(property, value) =>
            styleSelectedSymbols(selectedIds, property, value)
          }
        />
      )}
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
          paddingTop: "40px",
        }}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={(evt) => handleStageClick(evt)}
      >
        <Layer>
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
              width={defaultWidth}
              height={defaultHeight}
              x={pointerPosition.x}
              y={pointerPosition.y}
              rotation={0}
              stroke="rgba(0, 0, 0, 0.2)"
              strokeWidth={2}
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
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
