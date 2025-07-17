import { useState, type Dispatch, type SetStateAction } from "react";
import { type CommunicationSymbol } from "../types";
import { last } from "../helpers/lists";
import Konva from "konva";

export const useSymbols = () => {
  const [symbols, setSymbols] = useState<CommunicationSymbol[]>([]);

  const getNexId = (lastId?: string) => {
    let id = "symbol_";
    if (lastId) {
      id += Number(last(lastId.split("_"))) + 1;
    } else {
      id += "0";
    }

    return id;
  };

  const addSymbols = (symbols: Omit<CommunicationSymbol, "id">[]) => {
    setSymbols((prevSymbols) => {
      let nextId = getNexId(last(prevSymbols)?.id);

      return [
        ...prevSymbols,
        ...symbols.map((e) => {
          const symbol = { ...e, id: nextId };
          nextId = getNexId(nextId);

          return symbol;
        }),
      ];
    });
  };

  const handleAddSymbolStart = (evt: Konva.KonvaEventObject<MouseEvent>) => {
    addSymbols([
      {
        width: 0,
        height: 0,
        x: evt.evt.clientX,
        y: evt.evt.clientY,
        stroke: "black",
        strokeWidth: 1,
        rotation: 0,
        name: "symbol",
      },
    ]);
  };

  const handleAddSymbolResize = (evt: Konva.KonvaEventObject<MouseEvent>) => {
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
  };

  const handleAddSymbolEnd = (
    setSelectedIds: Dispatch<SetStateAction<string[]>>,
  ) => {
    if (last(symbols).width < 5 && last(symbols).height < 5) {
      setSymbols((prevSymbols) =>
        prevSymbols.map((e, idx) => {
          if (idx !== prevSymbols.length - 1) return e;

          return {
            ...e,
            width: 100,
            height: 100,
          };
        }),
      );
    }

    setSelectedIds([last(symbols).id]);
  };

  const handleDragEnd = (
    evt: Konva.KonvaEventObject<DragEvent>,
    id: string,
  ) => {
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
  };

  const handleDeleteSelectedSymbol = (selectedIds: string[]) => {
    setSymbols((prevSymbols) =>
      prevSymbols.filter((e) => !selectedIds.includes(e.id)),
    );
  };

  const styleSelectedSymbols = <T extends keyof CommunicationSymbol>(
    selectedIds: string[],
    property: T,
    value: CommunicationSymbol[T],
  ) => {
    setSymbols((prevSymbols) =>
      prevSymbols.map((e) => {
        if (selectedIds.includes(e.id)) {
          return { ...e, [property]: value };
        }

        return e;
      }),
    );
  };

  const handleTransformEnd = (evt: Konva.KonvaEventObject<Event>) => {
    const id = evt.target.id();
    const node = evt.target;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    if (scaleX === 1 && scaleY === 1) return;

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

  return {
    symbols,
    setSymbols,
    addSymbols,
    handleAddSymbolStart,
    handleAddSymbolResize,
    handleAddSymbolEnd,
    handleDragEnd,
    handleDeleteSelectedSymbol,
    styleSelectedSymbols,
    handleTransformEnd,
  };
};
