import { Layer, Stage } from "react-konva";
import SymbolCard from "./components/SymbolCard";
import Konva from "konva";
import React, { useEffect, useRef, useState } from "react";
import Sidebar, { type onStyleChangeFn } from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import type * as CSS from "csstype";
import { last } from "./helpers/lists";
import { KeyCode } from "./consts/key_codes";

export type CommunicationSymbol = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image?: string;
  stroke: string;
  strokeWidth: number;
  backgroundColor?: string;
};

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [symbols, setSymbols] = useState<CommunicationSymbol[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cursor, setCursor] = useState<CSS.Property.Cursor>("default");
  const [isAddingSymbol, setIsAddingSymbol] = useState(false);

  useEffect(() => {
    containerRef?.current?.focus();
  }, []);

  function handleAddSymbol(): void {
    setCursor("crosshair");
  }

  function handleAddSymbolStart(evt: Konva.KonvaEventObject<MouseEvent>) {
    if (cursor !== "crosshair") return;
    setIsAddingSymbol(true);

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
        },
      ];
    });
  }

  function handleAddSymbolResize(evt: Konva.KonvaEventObject<MouseEvent>) {
    if (cursor !== "crosshair") return;
    if (!isAddingSymbol) return;

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
    setIsAddingSymbol(false);
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
    console.log(evt);
    switch (evt.key) {
      case KeyCode.Delete: // left
        handleDeleteSelectedSymbol();
        break;
      default:
        return;
    }
    evt.preventDefault();
  };

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
        onMouseDown={handleAddSymbolStart}
        onMouseUp={handleAddSymbolEnd}
        onMouseMove={handleAddSymbolResize}
      >
        <Layer>
          {symbols.map((e) => (
            <SymbolCard
              key={e.id}
              symbol={e}
              isSelected={selectedIds.includes(e.id)}
              onDragEnd={handleDragEnd}
              onClick={handleSelect}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
