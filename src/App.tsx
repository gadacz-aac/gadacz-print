import { Layer, Rect, Stage, Transformer } from "react-konva";
import SymbolCard from "./components/SymbolCard";
import Konva from "konva";
import React, { useEffect, useRef, useState } from "react";
import Sidebar, { type onStyleChangeFn } from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import type * as CSS from "csstype";
import { last } from "./helpers/lists";
import { KeyCode } from "./consts/key_codes";
import { getClientRect } from "./helpers/konva";

export type CommunicationSymbol = {
  id: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  image?: string;
  stroke: string;
  strokeWidth: number;
  backgroundColor?: string;
  name: "symbol";
};

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const rectRefs = useRef<Map<string, Konva.Group>>(new Map());

  const [symbols, setSymbols] = useState<CommunicationSymbol[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [selectionRectangle, setSelectionRectangle] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  const [cursor, setCursor] = useState<CSS.Property.Cursor>("default");
  const isAddingSymbol = useRef(false);
  const isSelecting = useRef(false);

  useEffect(() => {
    containerRef?.current?.focus();
  }, []);

  useEffect(() => {
    if (selectedIds.length && transformerRef.current) {
      // Get the nodes from the refs Map
      const nodes = selectedIds
        .map((id) => rectRefs.current.get(id))
        .filter((node) => node !== undefined);

      transformerRef.current.nodes(nodes);
    } else if (transformerRef.current) {
      // Clear selection
      transformerRef.current.nodes([]);
    }
  }, [selectedIds]);

  function handleAddSymbol(): void {
    setCursor("crosshair");
  }

  function handleAddSymbolStart(evt: Konva.KonvaEventObject<MouseEvent>) {
    if (cursor !== "crosshair") return;
    isAddingSymbol.current = true;

    setSymbols((prevSymbols) => {
      const lastId = prevSymbols[prevSymbols.length - 1]?.id;

      let id = "symbol_";
      if (lastId) {
        id += Number(last(lastId.split("_"))) + 1;
      } else {
        id += "0";
      }

      return [
        ...prevSymbols,
        {
          id,
          width: 0,
          height: 0,
          x: evt.evt.clientX,
          y: evt.evt.clientY,
          stroke: "white",
          strokeWidth: 1,
          rotation: 0,
          name: "symbol",
        },
      ];
    });
  }

  function handleAddSymbolResize(evt: Konva.KonvaEventObject<MouseEvent>) {
    if (cursor !== "crosshair") return;
    if (!isAddingSymbol.current) return;

    setSymbols((prevSymbols) =>
      prevSymbols.map((e, idx) => {
        if (idx !== prevSymbols.length - 1) return e;
        return {
          ...e,
          width: e.width + evt.evt.movementX,
          height: e.height + evt.evt.movementY,
        };
      }),
    );
  }

  function handleAddSymbolEnd() {
    setCursor("default");
    isAddingSymbol.current = false;
  }

  function handleDragEnd(evt: Konva.KonvaEventObject<DragEvent>, id: string) {
    setSymbols(
      symbols.map((symbol) => {
        if (symbol.id === id) {
          return {
            ...symbol,
            x: evt.target.x(),
            y: evt.target.y(),
          };
        }
        return symbol;
      }),
    );
  }

  function handleDeleteSelectedSymbol() {
    setSymbols((prevSymbols) =>
      prevSymbols.filter((e) => !selectedIds.includes(e.id)),
    );
  }

  function handleSelect(evt: Konva.KonvaEventObject<MouseEvent>, id: string) {
    if (selectedIds.includes(id)) {
      return setSelectedIds((prev) => prev.filter((e) => e !== id));
    }

    if (evt.evt.ctrlKey || evt.evt.shiftKey) {
      setSelectedIds((prev) => [...prev, id]);
    } else setSelectedIds([id]);
  }

  const styleSelectedSymbols: onStyleChangeFn = (property, value) => {
    setSymbols((prevSymbols) =>
      prevSymbols.map((e) => {
        if (selectedIds.includes(e.id)) {
          return { ...e, [property]: value };
        }

        return e;
      }),
    );
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (evt) => {
    switch (evt.key) {
      case KeyCode.Delete: // left
        handleDeleteSelectedSymbol();
        break;
      default:
        return;
    }
    evt.preventDefault();
  };

  function startSelectionRectangle(evt: Konva.KonvaEventObject<MouseEvent>) {
    if (isAddingSymbol.current) return;

    // Start selection rectangle
    isSelecting.current = true;
    const pos = evt.target.getStage()?.getPointerPosition();

    if (!pos) return;

    setSelectionRectangle({
      visible: true,
      x1: pos.x,
      y1: pos.y,
      x2: pos.x,
      y2: pos.y,
    });
  }

  function handleStageMouseDown(evt: Konva.KonvaEventObject<MouseEvent>): void {
    if (evt.target !== evt.target.getStage()) {
      return;
    }

    handleAddSymbolStart(evt);
    startSelectionRectangle(evt);
  }

  function resizeSelectionRectangle(evt: Konva.KonvaEventObject<MouseEvent>) {
    // Do nothing if we didn't start selection
    if (!isSelecting.current) {
      return;
    }

    const pos = evt.target.getStage()?.getPointerPosition();

    if (!pos) return;

    setSelectionRectangle({
      ...selectionRectangle,
      x2: pos.x,
      y2: pos.y,
    });
  }

  function hideSelectionRectangle() {
    // Do nothing if we didn't start selection
    if (!isSelecting.current) {
      return;
    }
    isSelecting.current = false;

    // Update visibility in timeout, so we can check it in click event
    setTimeout(() => {
      setSelectionRectangle({
        ...selectionRectangle,
        visible: false,
      });
    });

    const selBox = {
      x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
      y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
      width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
      height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
    };

    const selected = symbols.filter((rect) => {
      // Check if rectangle intersects with selection box
      return Konva.Util.haveIntersection(selBox, getClientRect(rect));
    });

    setSelectedIds(selected.map((rect) => rect.id));
  }

  function handleStageMouseMove(evt: Konva.KonvaEventObject<MouseEvent>) {
    handleAddSymbolResize(evt);
    resizeSelectionRectangle(evt);
  }

  function handleStageMouseUp() {
    handleAddSymbolEnd();
    hideSelectionRectangle();
  }

  const handleTransformEnd = (evt: Konva.KonvaEventObject<Event>) => {
    // Find which rectangle(s) were transformed
    const id = evt.target.id();
    const node = evt.target;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    if (scaleX === 1 && scaleY === 1) return;

    // Reset scale
    node.scaleX(1);
    node.scaleY(1);

    setSymbols((prevSymbols) => {
      const newRects = [...prevSymbols];

      const index = newRects.findIndex((r) => r.id === id);

      if (index !== -1) {
        newRects[index] = {
          ...newRects[index],
          x: node.x(),
          y: node.y(),
          width: Math.max(5, newRects[index].width * scaleX),
          height: Math.max(5, newRects[index].height * scaleY),
          rotation: node.rotation(),
        };
      }

      return newRects;
    });
  };

  function handleStageClick(evt: Konva.KonvaEventObject<MouseEvent>) {
    // If we are selecting with rect, do nothing
    if (selectionRectangle.visible) {
      return;
    }

    // If click on empty area - remove all selections
    if (evt.target === evt.target.getStage()) {
      setSelectedIds([]);
      return;
    }

    // Do nothing if clicked NOT on our rectangles
    if (!evt.target.hasName("symbol")) {
      return;
    }

    const clickedId = evt.target.id();

    // Do we pressed shift or ctrl?
    const metaPressed = evt.evt.shiftKey || evt.evt.ctrlKey || evt.evt.metaKey;
    const isSelected = selectedIds.includes(clickedId);

    if (!metaPressed && !isSelected) {
      // If no key pressed and the node is not selected
      // select just one
      setSelectedIds([clickedId]);
    } else if (metaPressed && isSelected) {
      // If we pressed keys and node was selected
      // we need to remove it from selection
      setSelectedIds(selectedIds.filter((id) => id !== clickedId));
    } else if (metaPressed && !isSelected) {
      // Add the node into selection
      setSelectedIds([...selectedIds, clickedId]);
    }
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ position: "relative" }}
    >
      <Sidebar onStyleChange={styleSelectedSymbols} />
      <Toolbar onAddSymbol={handleAddSymbol} />
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ cursor }}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
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
              // Limit resize
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
