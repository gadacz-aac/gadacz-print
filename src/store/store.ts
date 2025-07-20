import { create } from "zustand";
import { createSelectionSlice, type SelectionSlice } from "./selection_slice";
import { createElementsSlice, type ElementsSlice } from "./elements_slice";
import { createSelectors } from "../helpers/zustand";

export const useAppStore = createSelectors(
  create<ElementsSlice & SelectionSlice>()((...a) => ({
    ...createElementsSlice(...a),
    ...createSelectionSlice(...a),
  })),
);
