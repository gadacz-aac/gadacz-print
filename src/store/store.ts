import {
  createStore,
  type StateCreator,
  type StoreMutatorIdentifier,
} from "zustand";
import { devtools } from "zustand/middleware";
import { temporal } from "zundo";
import { createSelectors } from "../helpers/zustand";
import {
  createContextMenuSlice,
  type ContextMenuSlice,
} from "./context_menu_slice";
import { createCopySlice, type CopySlice } from "./copy_slice";
import { createElementsSlice, type ElementsSlice } from "./elements_slice";
import { createFileSlice, type FileSlice } from "./file_slice";
import { createSelectionSlice, type SelectionSlice } from "./selection_slice";
import { createToolSlice, type ToolSlice } from "./tool_slice";
import { shallow } from "zustand/shallow";

export type AppStore = ElementsSlice &
  SelectionSlice &
  ToolSlice &
  CopySlice &
  FileSlice &
  ContextMenuSlice;

export type AppStateCreator<T> = StateCreator<
  AppStore,
  [[StoreMutatorIdentifier, never], ["zustand/devtools", never]],
  [],
  T
>;

export const appStore = createStore<AppStore>()(
  devtools(
    temporal(
      (...a) => ({
        ...createElementsSlice(...a),
        ...createSelectionSlice(...a),
        ...createToolSlice(...a),
        ...createCopySlice(...a),
        ...createFileSlice(...a),
        ...createContextMenuSlice(...a),
      }),
      {
        partialize: (state) => ({
          elements: state.elements,
          numberOfPages: state.numberOfPages,
        }),
        equality: shallow,
      },
    ),
  ),
);

export const useAppStore = createSelectors(appStore);
