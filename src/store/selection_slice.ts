import Konva from "konva";
import { getClientRect, isStage } from "../helpers/konva";
import type { Scale } from "../hooks/useScale";
import type { AppStateCreator } from "./store";

export interface SelectionSlice {
  selectedIds: string[];
  selectionRectangle: {
    visible: boolean;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  startSelectionRectangle: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  resizeSelectionRectangle: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  hideSelectionRectangle: (scale: Scale) => void;
  handleStageClick: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  handleMouseDown: (
    evt: Konva.KonvaEventObject<MouseEvent>,
    id: string,
  ) => void;
  setSelectedIds: (
    customerSetter: string[] | ((prev: string[]) => string[]),
  ) => void;
  selectAll: () => void;
}

export const createSelectionSlice: AppStateCreator<SelectionSlice> = (
  set,
  get,
) => ({
  selectedIds: [],
  selectionRectangle: {
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  },
  startSelectionRectangle: (evt) => {
    const pos = evt.target.getStage()?.getPointerPosition();

    if (!pos) return;

    set(
      () => ({
        selectionRectangle: {
          visible: false,
          x1: pos.x,
          y1: pos.y,
          x2: pos.x,
          y2: pos.y,
        },
      }),
      undefined,
      "selection/startSelectionRectangle",
    );
  },
  resizeSelectionRectangle: (evt) => {
    const pos = evt.target.getStage()?.getPointerPosition();

    if (!pos) return;

    set(
      ({ selectionRectangle }) => ({
        selectionRectangle: {
          ...selectionRectangle,
          visible: true,
          x2: pos.x,
          y2: pos.y,
        },
      }),
      undefined,
      "selection/resizeSelectionRectangle",
    );
  },
  hideSelectionRectangle: ({ WidthToA4 }) => {
    if (!get().selectionRectangle.visible) return;
    setTimeout(() => {
      set(
        ({ selectionRectangle }) => ({
          selectionRectangle: {
            ...selectionRectangle,
            visible: false,
          },
        }),
        undefined,
        "selection/hideSelectionRectangle",
      );
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

    set(
      () => ({
        selectedIds: selected.map((rect) => rect.id),
      }),
      undefined,
      "selection/hideSelectionRectangle",
    );
  },
  handleStageClick: (evt) => {
    if (get().selectionRectangle.visible) {
      return;
    }

    const isLeft = evt.evt.button === 0;
    if (isStage(evt) && isLeft) {
      set(
        () => ({
          selectedIds: [],
        }),
        undefined,
        "selection/handleStageClick",
      );
      return;
    }
  },
  handleMouseDown: (evt, clickedId) => {
    const metaPressed = evt.evt.shiftKey || evt.evt.ctrlKey || evt.evt.metaKey;
    const isSelected = get().selectedIds.includes(clickedId);

    set(
      ({ selectedIds }) => {
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
      },
      undefined,
      "selection/handleStageClick",
    );
  },
  setSelectedIds: (customSetter) => {
    set(
      ({ selectedIds }) => ({
        selectedIds:
          typeof customSetter === "function"
            ? customSetter(selectedIds)
            : customSetter,
      }),
      undefined,
      "selection/setSelectedIds",
    );
  },
  selectAll: () => {
    set(({ elements }) => ({
      selectedIds: elements.map((e) => e.id),
    }));
  },
});
