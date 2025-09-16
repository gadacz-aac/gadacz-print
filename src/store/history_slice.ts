import { type AppStateCreator } from "./store";
import type { CanvasShape } from "../types";

type HistoryState = {
  elements: CanvasShape[];
  numberOfPages: number;
};

export interface HistorySlice {
  past: HistoryState[];
  future: HistoryState[];
  undo: () => void;
  redo: () => void;
}

export const createHistorySlice: AppStateCreator<HistorySlice> = (
  set,
  get,
) => ({
  past: [],
  future: [],
  undo: () => {
    const { past } = get();
    if (past.length === 0) {
      return;
    }

    const previousState = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    const { elements, numberOfPages } = get();
    const currentState = { elements, numberOfPages };

    set(
      {
        past: newPast,
        future: [currentState, ...get().future],
        elements: previousState.elements,
        numberOfPages: previousState.numberOfPages,
      },
      false,
      "history/undo",
    );
  },
  redo: () => {
    const { future } = get();
    if (future.length === 0) {
      return;
    }

    const nextState = future[0];
    const newFuture = future.slice(1);

    const { elements, numberOfPages } = get();
    const currentState = { elements, numberOfPages };

    set(
      {
        past: [...get().past, currentState],
        future: newFuture,
        elements: nextState.elements,
        numberOfPages: nextState.numberOfPages,
      },
      false,
      "history/redo",
    );
  },
});