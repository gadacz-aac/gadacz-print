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

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const rectRefs = useRef<Map<string, Konva.Group>>(new Map());

  const [cursor, setCursor] = useState<CSS.Property.Cursor>("default");
  const isAddingSymbol = useRef(false);
  const isSelecting = useRef(false);

  const {
    symbols,
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
    if (evt.target !== evt.target.getStage()) {
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

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ position: "relative" }}
    >
      <Sidebar
        onStyleChange={(property, value) =>
          styleSelectedSymbols(selectedIds, property, value)
        }
      />
      <Toolbar onAddSymbol={handleAddSymbol} />
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ cursor }}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={(evt) => handleStageClick(evt)}
      >
        <Layer>
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
