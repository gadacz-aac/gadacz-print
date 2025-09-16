import { createStore, type StateCreator } from "zustand";
import { createSelectionSlice, type SelectionSlice } from "./selection_slice";
import { createElementsSlice, type ElementsSlice } from "./elements_slice";
import { createToolSlice, type ToolSlice } from "./tool_slice";
import { createSelectors } from "../helpers/zustand";
import { devtools } from "zustand/middleware";
import { createCopySlice, type CopySlice } from "./copy_slice";
import { createFileSlice, type FileSlice } from "./file_slice";
import {
  createContextMenuSlice,
  type ContextMenuSlice,
} from "./context_menu_slice";
import { createHistorySlice, type HistorySlice } from "./history_slice";
import { historyMiddleware } from "./history_middleware";

export type AppStore = ElementsSlice &
  SelectionSlice &
  ToolSlice &
  CopySlice &
  FileSlice &
  ContextMenuSlice &
  HistorySlice;

export type AppStateCreator<T> = StateCreator<
  AppStore,
  [["zustand/devtools", never]],
  [],
  T
>;

export const appStore = createStore<AppStore>()(
  devtools(
    historyMiddleware((...a) => ({
      ...createElementsSlice(...a),
      ...createSelectionSlice(...a),
      ...createToolSlice(...a),
      ...createCopySlice(...a),
      ...createFileSlice(...a),
      ...createContextMenuSlice(...a),
      ...createHistorySlice(...a),
    })),
  ),
);

export const useAppStore = createSelectors(appStore);
