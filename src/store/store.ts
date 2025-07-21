import { create, type StateCreator } from "zustand";
import { createSelectionSlice, type SelectionSlice } from "./selection_slice";
import { createElementsSlice, type ElementsSlice } from "./elements_slice";
import { createToolSlice, type ToolSlice } from "./tool_slice";
import { createSelectors } from "../helpers/zustand";
import { devtools } from "zustand/middleware";

export type AppStore = ElementsSlice & SelectionSlice & ToolSlice;
export type AppStateCreator<T> = StateCreator<
  AppStore,
  [["zustand/devtools", never]],
  [],
  T
>;

export const useAppStore = createSelectors(
  create<AppStore>()(
    devtools((...a) => ({
      ...createElementsSlice(...a),
      ...createSelectionSlice(...a),
      ...createToolSlice(...a),
    })),
  ),
);
