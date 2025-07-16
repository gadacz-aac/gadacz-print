import { Layer, Rect, Stage, Transformer } from "react-konva";
import SymbolCard from "./components/SymbolCard";
import Konva from "konva";
import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import type * as CSS from "csstype";
import { KeyCode } from "./consts/key_codes";
import { useSymbols } from "./hooks/useSymbols";
import { useSelection } from "./hooks/useSelection";
import jsPDF from "jspdf";
import { A4, PageAspectRatio } from "./consts/page_format";
import { isStage } from "./helpers/konva";
import PageBackground, { PageBreakName } from "./components/PageBackground";
import styles from "./App.module.css";

import PredefinedLayoutsModal from "./components/modals/PredefinedLayoutsModal";

export function getPageSize() {
  const width = window.innerWidth - 40;
  return [width, width * PageAspectRatio];
}

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const rectRefs = useRef<Map<string, Konva.Group>>(new Map());

  const [cursor, setCursor] = useState<CSS.Property.Cursor>("default");
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [isLayoutsModalOpen, setIsLayoutsModalOpen] = useState(false);
  const isAddingSymbol = useRef(false);
  const isSelecting = useRef(false);

  const [pageWidth, pageHeight] = getPageSize();

  const {
    symbols,
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
    selectionRectangle,
    handleSelect,
    startSelectionRectangle,
    resizeSelectionRectangle,
    hideSelectionRectangle,
    handleStageClick,
  } = useSelection(symbols);

  useEffect(() => {
    containerRef?.current?.focus();
  }, []);

  useEffect(() => {
    if (selectedIds.length && transformerRef.current) {
      const nodes = selectedIds
        .map((id) => rectRefs.current.get(id))
        .filter((node) => node !== undefined);

      transformerRef.current.nodes(nodes);
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedIds, symbols]);

  function handleAddSymbol(): void {
    setCursor("crosshair");
  }

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
    if (isAddingSymbol.current) {
      handleAddSymbolResize(evt);
    } else if (isSelecting.current) {
      resizeSelectionRectangle(evt);
    }
  }

  function handleStageMouseUp() {
    if (isAddingSymbol.current) {
      isAddingSymbol.current = false;
      setCursor("default");
      handleAddSymbolEnd();
    } else if (isSelecting.current) {
      isSelecting.current = false;
      hideSelectionRectangle();
    }
  }

  function handleDownload(): void {
    const A4Width = A4.landscape.width;
    const A4Height = A4.landscape.height;

    const pdf = new jsPDF("l", "px", [A4Width, A4Height]);

    const stage = stageRef.current;
    if (!stage) return;

    stage.find(`.${PageBreakName}`).forEach((e) => e.hide());

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

    pdf.save("canvas.pdf");
    stage.find(`.${PageBreakName}`).forEach((e) => e.show());
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={styles.container}
    >
      <Sidebar
        onStyleChange={(property, value) =>
          styleSelectedSymbols(selectedIds, property, value)
        }
      />
      <Toolbar
        onAddSymbol={handleAddSymbol}
        onDownload={handleDownload}
        insertPageBreak={() => setNumberOfPages((prev) => prev + 1)}
        openLayoutsModal={() => setIsLayoutsModalOpen(true)}
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
              isSelected={selectedIds.includes(e.id)}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
              onClick={handleSelect}
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
