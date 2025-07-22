import { randomFromRange } from "../helpers/random";
import type { CanvasShape } from "../types";
import { type AppStateCreator } from "./store";

export interface CopySlice {
  copied: CanvasShape[];
  copySelected: () => void;
  paste: () => void;
}

export const createCopySlice: AppStateCreator<CopySlice> = (set, get) => ({
  copied: [],
  copySelected: () => {
    const dx = randomFromRange(-10, 10);
    const dy = randomFromRange(-10, 10);
    set(({ elements, selectedIds }) => ({
      copied: elements
        .filter((e) => selectedIds.includes(e.id))
        .map((e) => ({
          ...e,
          width: e.width,
          height: e.height,
          x: e.x + dx,
          y: e.y + dy,
        })),
    }));
  },
  paste: () => {
    get().addSymbols(get().copied, (e) =>
      set(() => ({
        selectedIds: e.map((e) => e.id),
      })),
    );
  },
});
