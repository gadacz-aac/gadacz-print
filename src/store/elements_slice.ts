import {
  defaultBrush,
  defaultFontData,
  type BrushData,
  type CanvasShape,
  type FontData,
  type Positionable,
} from "../types";
import type Konva from "konva";
import type { Scale } from "../hooks/useScale";
import { last } from "../helpers/lists";
import type { AppStateCreator } from "./store";
import type { UnionOmit } from "../helpers/typescript";
import { SymbolTool } from "../consts/tools";
import SizeHelper from "../helpers/sizing";

export interface ElementsSlice {
  elements: CanvasShape[];
  lastId: number;
  brushData: BrushData;
  fontData: FontData;
  isResizingNewlyAddedSymbol: boolean;
  pointerPosition: { x: number; y: number };
  layoutModalData: {
    isOpen: boolean;
    insertOnPage?: number;
  };
  isLandscape: boolean;
  setShowLayoutModal: (show: boolean, pageNumber?: number) => void;
  setPointerPosition: (pos: { x: number; y: number }) => void;
  addElements: (
    symbols: UnionOmit<CanvasShape, "id">[],
    callback?: (newSymbols: CanvasShape[]) => void,
  ) => void;
  handleAddSymbolStart: (
    evt: Konva.KonvaEventObject<MouseEvent>,
    scale: Scale,
  ) => void;
  handleAddSymbolResize: (
    evt: Konva.KonvaEventObject<MouseEvent>,
    scale: Scale,
  ) => void;
  handleAddSymbolEnd: () => void;
  handleDragEnd: (
    evt: Konva.KonvaEventObject<DragEvent>,
    id: string,
    scale: Scale,
  ) => void;
  handleDeleteSelectedSymbol: () => void;
  setFontData: <T extends keyof FontData>(
    property: T,
    value: FontData[T],
  ) => void;
  setBrushData: <T extends keyof BrushData>(
    property: T,
    value: BrushData[T],
  ) => void;
  styleById: <K extends keyof CanvasShape>(
    id: string,
    property: K,
    value: CanvasShape[K],
  ) => void;
  styleSelected: <K extends keyof CanvasShape>(
    property: K,
    value: CanvasShape[K],
  ) => void;
  handleTransformEnd: (transformer: Konva.Transformer) => void;
  modifiedPositionByAxisAndGap: (
    selected: CanvasShape[],
    gap: number,
    axis: "x" | "y",
  ) => CanvasShape[];
  handleGapChange: (gap: { x?: number; y?: number }) => void;
  align: (axis: "x" | "y", type: "start" | "center" | "end") => void;
  insertLayout: (layout: CanvasShape[]) => void;
  toggleOrientation: () => void;
}

export const createElementsSlice: AppStateCreator<ElementsSlice> = (
  set,
  get,
) => {
  const findGridLines = (
    shapes: CanvasShape[],
    axis: "x" | "y",
  ): number[] => {
    const counts = new Map<number, { pos: number; count: number }>();
    shapes.forEach((shape) => {
      const key = Math.round(shape[axis] / 20) * 20;
      const entry = counts.get(key) || { pos: 0, count: 0 };
      counts.set(key, { pos: entry.pos + shape[axis], count: entry.count + 1 });
    });

    const lines: number[] = [];
    counts.forEach((value) => {
      lines.push(value.pos / value.count); // average position for the line
    });
    return lines.sort((a, b) => a - b);
  };

  const findClosest = (value: number, array: number[]): number => {
    if (array.length === 0) return value;
    return array.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
  };

  const snapToGrid = (
    shapes: CanvasShape[],
    xGridLines: number[],
    yGridLines: number[],
  ): CanvasShape[] => {
    return shapes.map((shape) => ({
      ...shape,
      x: findClosest(shape.x, xGridLines),
      y: findClosest(shape.y, yGridLines),
    }));
  };

  return {
    elements: [],
    lastId: 0,
    brushData: defaultBrush,
    fontData: defaultFontData,
    selectedIds: [],
    layoutModalData: {
      isOpen: false,
    },
    isResizingNewlyAddedSymbol: false,
    isLandscape: true,
    pointerPosition: { x: 0, y: 0 },
    setPointerPosition: ({ x, y }) => {
      set(
        () => ({
          pointerPosition: {
            x,
            y,
          },
        }),
        undefined,
        "elements/setPointerPosition",
      );
    },
    addElements: (elements, callback) =>
      set(
        ({ lastId, elements: prevElements }) => {
          let localLastId = lastId;

          const newElements = elements.map((e) => ({
            ...e,
            id: `${e.name}_${localLastId++}`,
          }));

          callback?.(newElements);

          return {
            lastId: localLastId,
            elements: [...prevElements, ...newElements],
          };
        },
        undefined,
        "elements/addSymbols",
      ),
    handleAddSymbolStart: (
      evt: Konva.KonvaEventObject<MouseEvent>,
      { A4ToWidth },
    ) => {
      const pos = evt.target.getStage()?.getPointerPosition();

      if (!pos) {
        console.warn("POS is null");
        return;
      }

      const baseElement: UnionOmit<CanvasShape, "id"> = {
        ...get().brushData,
        ...get().fontData,
        name: get().tool === SymbolTool ? "symbol" : "text",
        x: pos.x * A4ToWidth,
        y: pos.y * A4ToWidth,
        width: 0,
        height: 0,
        rotation: 0,
      };

      get().addElements([baseElement]);
    },
    handleAddSymbolResize: (
      evt: Konva.KonvaEventObject<MouseEvent>,
      { A4ToWidth }: Scale,
    ) => {
      set(
        ({ elements }) => ({
          isResizingNewlyAddedSymbol: true,
          selectedIds: [last(elements).id],
          elements: elements.map((e, idx) => {
            if (idx !== elements.length - 1) return e;
            return {
              ...e,
              width: e.width + evt.evt.movementX * A4ToWidth,
              height: e.height + evt.evt.movementY * A4ToWidth,
            };
          }),
        }),
        undefined,
        "elements/handleAddSymbolResize",
      );
    },
    handleAddSymbolEnd: () => {
      set(
        ({ elements }) => {
          const newElements = elements.map((e, idx, { length }) => {
            if (idx !== length - 1) return e;

            if (e.width < 0) {
              e.width = Math.abs(e.width);
              e.x -= e.width;
            }

            if (e.height < 0) {
              e.height = Math.abs(e.height);
              e.y -= e.height;
            }

            if (e.width < 5 && e.height < 5) {
              e.width = get().brushData.width;
              e.height = get().brushData.height;
            }

            return { ...e };
          });

          return {
            selectedIds: [last(elements).id],
            elements: newElements,
            isResizingNewlyAddedSymbol: false,
          };
        },
        undefined,
        "elements/handleAddSymbolEnd",
      );
    },
    handleDragEnd: (evt, id, { A4ToWidth }) =>
      set(
        ({ elements }) => ({
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
        }),
        undefined,
        "elements/handleDragEnd",
      ),
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
    setFontData: (property, value) => {
      set(
        ({ fontData }) => ({
          fontData: {
            ...fontData,
            [property]: value,
          },
        }),
        undefined,
        "elements/setFontData",
      );
    },
    setBrushData: (property, value) => {
      set(
        ({ brushData }) => ({
          brushData: {
            ...brushData,
            [property]: value,
          },
        }),
        undefined,
        "elements/setBrushData",
      );
    },
    styleById: (id, property, value) => {
      set(
        ({ elements }) => ({
          elements: elements.map((e) => {
            if (id === e.id) {
              return { ...e, [property]: value };
            }

            return e;
          }),
        }),
        undefined,
        "elements/styleById",
      );
    },
    styleSelected: (property, value) => {
      set(
        ({ selectedIds, elements }) => ({
          elements: elements.map((e) => {
            if (selectedIds.includes(e.id)) {
              return { ...e, [property]: value };
            }

            return e;
          }),
        }),
        undefined,
        "elements/styleSelectedSymbols",
      );
    },
    handleTransformEnd: (transformer) => {
      set(
        ({ elements }) => {
          const { A4ToWidth } = SizeHelper.calculateScale(
            SizeHelper.caluclatePageDimensions(get().isLandscape)[0],
            get().isLandscape,
          );

          const newRects = [...elements];

          for (const node of transformer.nodes()) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            if (scaleX === 1 && scaleY === 1) continue;

            node.scaleX(1);
            node.scaleY(1);

            const index = newRects.findIndex((r) => r.id === node.id());

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
          }

          return {
            elements: newRects,
          };
        },
        undefined,
        "elements/handleTranformEnd",
      );
    },
    modifiedPositionByAxisAndGap: (selected, gap, axis) => {
      if (selected.length < 2) {
        return selected;
      }

      const yGridLines = findGridLines(selected, "y");
      const xGridLines = findGridLines(selected, "x");

      const snappedShapes = snapToGrid(selected, xGridLines, yGridLines);

      if (axis === "x") {
        // Sort by y, then x to process row by row
        const sorted = [...snappedShapes].sort((a, b) => {
          if (Math.abs(a.y - b.y) > 10) return a.y - b.y;
          return a.x - b.x;
        });

        const rows = new Map<number, CanvasShape[]>();
        sorted.forEach((s) => {
          const rowKey = Math.round(s.y / 10);
          if (!rows.has(rowKey)) rows.set(rowKey, []);
          rows.get(rowKey)!.push(s);
        });

        const newShapes = new Map<string, CanvasShape>();
        snappedShapes.forEach((s) => newShapes.set(s.id, s));

        rows.forEach((row) => {
          for (let i = 1; i < row.length; i++) {
            const prev = newShapes.get(row[i - 1].id)!;
            const current = newShapes.get(row[i].id)!;
            const newX = prev.x + prev.width + gap;
            newShapes.set(current.id, { ...current, x: newX });
          }
        });
        return Array.from(newShapes.values());
      } else {
        // axis === 'y'
        // Sort by x, then y to process column by column
        const sorted = [...snappedShapes].sort((a, b) => {
          if (Math.abs(a.x - b.x) > 10) return a.x - b.x;
          return a.y - b.y;
        });

        const cols = new Map<number, CanvasShape[]>();
        sorted.forEach((s) => {
          const colKey = Math.round(s.x / 10);
          if (!cols.has(colKey)) cols.set(colKey, []);
          cols.get(colKey)!.push(s);
        });

        const newShapes = new Map<string, CanvasShape>();
        snappedShapes.forEach((s) => newShapes.set(s.id, s));

        cols.forEach((col) => {
          for (let i = 1; i < col.length; i++) {
            const prev = newShapes.get(col[i - 1].id)!;
            const current = newShapes.get(col[i].id)!;
            const newY = prev.y + prev.height + gap;
            newShapes.set(current.id, { ...current, y: newY });
          }
        });
        return Array.from(newShapes.values());
      }
    },
    handleGapChange: ({ x, y }) => {
      set(
        ({ selectedIds, elements }) => {
          const notSelected = elements.filter((e) => !selectedIds.includes(e.id));
          let selected = elements.filter((e) => selectedIds.includes(e.id));

          if (x !== undefined) {
            selected = get().modifiedPositionByAxisAndGap(selected, x, "x");
          }

          if (y !== undefined) {
            selected = get().modifiedPositionByAxisAndGap(selected, y, "y");
          }

          return {
            elements: [...selected, ...notSelected],
          };
        },
        undefined,
        "elements/handleGapChange",
      );
    },
    setShowLayoutModal: (show, pageNumber) => {
      set(() => ({
        layoutModalData: {
          isOpen: show,
          insertOnPage: pageNumber,
        },
      }));
    },
    align: (axis, type) => {
      set(({ elements, selectedIds }) => {
        const unselected = elements.filter(({ id }) => !selectedIds.includes(id));
        const alignt = elements
          .filter(({ id }) => selectedIds.includes(id))
          .sort((a, b) => a[axis] - b[axis])
          .map((e, _, arr) => {
            switch (type) {
              case "start": {
                return {
                  ...e,
                  [axis]: (e[axis] = arr[0][axis]),
                };
              }
              case "end": {
                return {
                  ...e,
                  [axis]: (e[axis] = last(arr)[axis]),
                };
              }
              case "center": {
                const lastItem = last(arr);
                const dim = axis === "x" ? "width" : "height";
                const middle =
                  (arr[0][axis] + lastItem[axis] + lastItem[dim]) / 2;

                return { ...e, [axis]: middle - e[dim] / 2 };
              }
            }
          });

        return {
          elements: [...alignt, ...unselected],
        };
      });
    },
    insertLayout: (layout) => {
      const pageNumber = get().layoutModalData.insertOnPage ?? 0;
      const [width, height] = SizeHelper.caluclatePageDimensions(
        get().isLandscape,
      );
      const scale = SizeHelper.calculateScale(width, get().isLandscape);

      get().addElements(
        layout.map((e) => ({
          ...e,
          y: e.y + pageNumber * height * scale.A4ToWidth,
        })),
      );
    },
    toggleOrientation: () => {
      set(({ isLandscape, elements }) => {
        const _isLandscape = !isLandscape;

        const [width, height] = SizeHelper.caluclatePageDimensions(_isLandscape);
        const scale = SizeHelper.calculateScale(width, _isLandscape);

        return {
          isLandscape: _isLandscape,
          elements: elements.map((e) => ({
            ...e,
            x: _isLandscape ? e.y : width * scale.A4ToWidth - e.y - e.height,
            y: _isLandscape ? height * scale.A4ToWidth - e.x - e.width : e.x,
            width: e.height,
            height: e.width,
          })),
        };
      });
    },
  };
};
