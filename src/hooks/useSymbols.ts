import { useState, type Dispatch, type SetStateAction } from "react";
import {
  defaultBrush,
  type BrushData,
  type CommunicationSymbol,
} from "../types";
import { last } from "../helpers/lists";
import Konva from "konva";
import useScale from "./useScale";
import { defaultHeight, defaultWidth } from "../consts/symbol";

export const useSymbols = () => {
  const [symbols, setSymbols] = useState<CommunicationSymbol[]>([]);

  const [brushData, _setBrushData] = useState<BrushData>(defaultBrush);
  const [isResizingNewlyAddedSymbol, setIsResizingNewlyAddedSymbol] =
    useState(false);
  const { A4ToWidth } = useScale();

  const _getNexId = (lastId?: string) => {
    let id = "symbol_";
    if (lastId) {
      id += Number(last(lastId.split("_"))) + 1;
    } else {
      id += "0";
    }

    return id;
  };

  const addSymbols = (
    symbols: Omit<CommunicationSymbol, "id">[],
    callback?: (newSymbols: CommunicationSymbol[]) => void,
  ) => {
    setSymbols((prevSymbols) => {
      let nextId = _getNexId(last(prevSymbols)?.id);
      const newSymbols = symbols.map((e) => {
        const symbol = {
          ...e,
          id: nextId,
          width: e.width,
          height: e.height,
          x: e.x,
          y: e.y,
        };
        nextId = _getNexId(nextId);

        return symbol;
      });

      callback?.(newSymbols);

      return [...prevSymbols, ...newSymbols];
    });
  };

  const handleAddSymbolStart = (evt: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = evt.target.getStage()?.getPointerPosition();

    if (!pos) {
      console.warn("POS is null");
      return;
    }

    addSymbols([
      {
        ...brushData,
        width: 0,
        height: 0,
        x: pos.x,
        y: pos.y,
        rotation: 0,
        name: "symbol",
      },
    ]);
  };

  const handleAddSymbolResize = (evt: Konva.KonvaEventObject<MouseEvent>) => {
    setIsResizingNewlyAddedSymbol(true);
    setSymbols((prevSymbols) =>
      prevSymbols.map((e, idx) => {
        if (idx !== prevSymbols.length - 1) return e;
        return {
          ...e,
          width: e.width + evt.evt.movementX * A4ToWidth,
          height: e.height + evt.evt.movementY * A4ToWidth,
        };
      }),
    );
  };

  const handleAddSymbolEnd = (
    evt: Konva.KonvaEventObject<MouseEvent>,
    setSelectedIds: Dispatch<SetStateAction<string[]>>,
  ) => {
    setIsResizingNewlyAddedSymbol(false);
    if (
      Math.abs(last(symbols).width) < 5 &&
      Math.abs(last(symbols).height) < 5
    ) {
      setSymbols((prevSymbols) =>
        prevSymbols.map((e, idx) => {
          if (idx !== prevSymbols.length - 1) return e;

          const pos = evt.currentTarget.getStage()?.getPointerPosition();

          if (!pos) {
            console.warn("POS is null");
            return e;
          }

          return {
            ...e,
            x: pos.x * A4ToWidth,
            y: pos.y * A4ToWidth,
            width: defaultWidth,
            height: defaultHeight,
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
            x: evt.target.x() * A4ToWidth,
            y: evt.target.y() * A4ToWidth,
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

  const setBrushData = <T extends keyof CommunicationSymbol>(
    property: T,
    value: CommunicationSymbol[T],
  ) => {
    _setBrushData((prev) => ({ ...prev, [property]: value }));
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
          x: node.x() * A4ToWidth,
          y: node.y() * A4ToWidth,
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
  };
};
