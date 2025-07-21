import {
  defaultBrush,
  defaultFontData,
  type BrushData,
  type CommunicationSymbol,
} from "../types";
import type Konva from "konva";
import type { Scale } from "../hooks/useScale";
import { last } from "../helpers/lists";
import { defaultHeight, defaultWidth } from "../consts/symbol";
import { type CustomSet } from "../helpers/zustand";
import type { AppStateCreator } from "./store";

export interface ElementsSlice {
  elements: CommunicationSymbol[];
  lastId: number;
  brushData: BrushData;
  isResizingNewlyAddedSymbol: boolean;
  addSymbols: (
    symbols: Omit<CommunicationSymbol, "id">[],
    callback?: (newSymbols: CommunicationSymbol[]) => void,
  ) => void;
  handleAddSymbolStart: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  handleAddSymbolResize: (
    evt: Konva.KonvaEventObject<MouseEvent>,
    scale: Scale,
  ) => void;
  handleAddSymbolEnd: (
    evt: Konva.KonvaEventObject<MouseEvent>,
    scale: Scale,
  ) => void;
  handleDragEnd: (
    evt: Konva.KonvaEventObject<DragEvent>,
    id: string,
    scale: Scale,
  ) => void;
  handleDeleteSelectedSymbol: () => void;
  setBrushData: <T extends keyof CommunicationSymbol>(
    property: T,
    value: CommunicationSymbol[T],
  ) => void;
  styleSelectedSymbols: <T extends keyof CommunicationSymbol>(
    selectedIds: string[],
    property: T,
    value: CommunicationSymbol[T],
  ) => void;
  handleTransformEnd: (
    evt: Konva.KonvaEventObject<Event>,
    scale: Scale,
  ) => void;
  modifiedPositionByAxisAndGap: (
    selected: CommunicationSymbol[],
    gap: number,
    axis: "x" | "y",
  ) => void;
  handleGapChange: (selectedIds: string[], x?: number, y?: number) => void;
  setElements: CustomSet<CommunicationSymbol[]>;
}

export const createElementsSlice: AppStateCreator<ElementsSlice> = (
  set,
  get,
) => ({
  elements: [],
  lastId: 0,
  brushData: defaultBrush,
  selectedIds: [],
  isResizingNewlyAddedSymbol: false,
  addSymbols: (symbols, callback) =>
    set(({ lastId, elements }) => {
      let localLastId = lastId;

      const newElements = symbols.map((e) => {
        const symbol = {
          ...e,
          id: "symbol_" + String(localLastId++),
          width: e.width,
          height: e.height,
          x: e.x,
          y: e.y,
        };

        return symbol;
      });

      callback?.(newElements);

      return {
        lastId: localLastId,
        elements: [...elements, ...newElements],
      };
    }),
  handleAddSymbolStart: (evt: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = evt.target.getStage()?.getPointerPosition();

    if (!pos) {
      console.warn("POS is null");
      return;
    }

    get().addSymbols([
      {
        ...get().brushData,
        ...defaultFontData,
        width: 0,
        height: 0,
        x: pos.x,
        y: pos.y,
        rotation: 0,
        name: "symbol",
      },
    ]);
  },
  handleAddSymbolResize: (
    evt: Konva.KonvaEventObject<MouseEvent>,
    { A4ToWidth }: Scale,
  ) => {
    set(({ elements }) => ({
      isResizingNewlyAddedSymbol: true,
      elements: elements.map((e, idx) => {
        if (idx !== elements.length - 1) return e;
        return {
          ...e,
          width: e.width + evt.evt.movementX * A4ToWidth,
          height: e.height + evt.evt.movementY * A4ToWidth,
        };
      }),
    }));
  },
  handleAddSymbolEnd: (evt, { A4ToWidth }) => {
    set(({ elements }) => {
      if (
        Math.abs(last(elements).width) < 5 &&
        Math.abs(last(elements).height) < 5
      ) {
        elements = elements.map((e, idx) => {
          if (idx !== elements.length - 1) return e;

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
        });
      }

      return {
        selectedIds: [last(elements).id],
        elements,
        isResizingNewlyAddedSymbol: false,
      };
    });
  },
  handleDragEnd: (evt, id, { A4ToWidth }) =>
    set(({ elements }) => ({
      elements: elements.map((symbol) => {
        if (symbol.id === id) {
          return {
            ...symbol,
            x: evt.target.x() * A4ToWidth,
            y: evt.target.y() * A4ToWidth,
          };
        }
        return symbol;
      }),
    })),
  handleDeleteSelectedSymbol: () => {
    set(
      ({ elements, selectedIds }) => ({
        elements: elements.filter((e) => !selectedIds.includes(e.id)),
        selectedIds: [],
      }),
      undefined,
      "elements/handleDeleteSelectedSymbol",
    );
  },
  setBrushData: (property, value) => {
    set(({ brushData }) => ({
      brushData: {
        ...brushData,
        [property]: value,
      },
    }));
  },
  styleSelectedSymbols: (selectedIds, property, value) => {
    set(({ elements }) => ({
      elements: elements.map((e) => {
        if (selectedIds.includes(e.id)) {
          return { ...e, [property]: value };
        }

        return e;
      }),
    }));
  },
  handleTransformEnd: (evt, { A4ToWidth }) => {
    const id = evt.target.id();
    const node = evt.target;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    if (scaleX === 1 && scaleY === 1) return;

    node.scaleX(1);
    node.scaleY(1);

    set(({ elements }) => {
      const newRects = [...elements];

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

      return {
        elements: newRects,
      };
    });
  },
  modifiedPositionByAxisAndGap: (selected, gap, axis) => {
    selected
      .sort((a, b) => a[axis] - b[axis])
      .forEach((cur, idx, array) => {
        if (idx === 0) return;

        const prev = array[idx - 1];

        selected[idx] = {
          ...cur,
          [axis]:
            Math.floor(prev[axis]) +
            Math.floor(prev[axis === "x" ? "width" : "height"]) +
            Math.floor(gap),
        };
      });
  },
  handleGapChange: (selectedIds, x, y) => {
    set(({ elements }) => {
      const notSelected = elements.filter((e) => !selectedIds.includes(e.id));

      const selected = elements.filter((e) => selectedIds.includes(e.id));

      if (x !== undefined) {
        get().modifiedPositionByAxisAndGap(selected, x, "x");
      }

      if (y !== undefined) {
        get().modifiedPositionByAxisAndGap(selected, y, "y");
      }

      return {
        elements: [...selected, ...notSelected],
      };
    });
  },
  setElements: (customSetter) => {
    set(({ elements }) => ({
      elements:
        typeof customSetter === "function" ? customSetter(elements) : elements,
    }));
  },
});
