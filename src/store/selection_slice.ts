import type { StateCreator } from "zustand";
import type { ElementsSlice } from "./elements_slice";
import Konva from "konva";
import { getClientRect, isStage } from "../helpers/konva";
import type { Scale } from "../hooks/useScale";
import type { CustomSet } from "../helpers/zustand";

export interface SelectionSlice {
  selectedIds: string[];
  selectionRectangle: {
    visible: boolean;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  handleSelect: (evt: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  startSelectionRectangle: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  resizeSelectionRectangle: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  hideSelectionRectangle: (scale: Scale) => void;
  handleStageClick: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  setSelectedIds: CustomSet<string[]>;
}

export const createSelectionSlice: StateCreator<
  ElementsSlice & SelectionSlice,
  [],
  [],
  SelectionSlice
> = (set, get) => ({
  selectedIds: [],
  selectionRectangle: {
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  },
  handleSelect: (evt, id) => {
    set(({ selectedIds }) => {
      if (selectedIds.includes(id)) {
        return { selectedIds: selectedIds.filter((e) => e !== id) };
      }

      if (evt.evt.ctrlKey || evt.evt.shiftKey) {
        return { selectedIds: [...selectedIds, id] };
      }

      return {
        selectedIds: [id],
      };
    });
  },

  startSelectionRectangle: (evt) => {
    const pos = evt.target.getStage()?.getPointerPosition();

    if (!pos) return;

    set(() => ({
      selectionRectangle: {
        visible: true,
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
      },
    }));
  },
  resizeSelectionRectangle: (evt) => {
    const pos = evt.target.getStage()?.getPointerPosition();

    if (!pos) return;

    set(({ selectionRectangle }) => ({
      selectionRectangle: {
        ...selectionRectangle,
        x2: pos.x,
        y2: pos.y,
      },
    }));
  },
  hideSelectionRectangle: ({ WidthToA4 }) => {
    setTimeout(() => {
      set(({ selectionRectangle }) => ({
        selectionRectangle: {
          ...selectionRectangle,
          visible: false,
        },
      }));
    });

    const selectionRectangle = get().selectionRectangle;

    const selBox = {
      x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
      y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
      width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
      height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
    };

    const selected = get().elements.filter((rect) => {
      return Konva.Util.haveIntersection(
        selBox,
        getClientRect({
          width: rect.width * WidthToA4,
          height: rect.height * WidthToA4,
          rotation: rect.rotation,
          x: rect.x * WidthToA4,
          y: rect.y * WidthToA4,
        }),
      );
    });

    set(() => ({
      selectedIds: selected.map((rect) => rect.id),
    }));
  },
  handleStageClick: (evt) => {
    if (get().selectionRectangle.visible) {
      return;
    }

    if (isStage(evt)) {
      set(() => ({
        selectedIds: [],
      }));
      return;
    }

    if (!evt.target.hasName("symbol")) {
      return;
    }

    const clickedId = evt.target.id();

    const metaPressed = evt.evt.shiftKey || evt.evt.ctrlKey || evt.evt.metaKey;
    const isSelected = get().selectedIds.includes(clickedId);

    set(({ selectedIds }) => {
      if (!metaPressed && !isSelected) {
        return {
          selectedIds: [clickedId],
        };
      }

      if (metaPressed && isSelected) {
        return {
          selectedIds: selectedIds.filter((id) => id !== clickedId),
        };
      }

      if (metaPressed && !isSelected) {
        return {
          selectedIds: [...selectedIds, clickedId],
        };
      }

      return {};
    });
  },
  setSelectedIds: (customSetter) => {
    set(({ selectedIds }) => ({
      selectedIds:
        typeof customSetter === "function"
          ? customSetter(selectedIds)
          : customSetter,
    }));
  },
});
