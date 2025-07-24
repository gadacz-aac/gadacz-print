import type Konva from "konva";
import { type AppStateCreator } from "./store";
import { isStage } from "../helpers/konva";
import SizeHelper from "../helpers/sizing";

export interface ContextMenuSlice {
  contextMenuPos: {
    x: number;
    y: number;
  };
  contextMenuState: {
    isOpened: boolean;
    isOverElement?: boolean;
  };
  closeContextMenu: () => void;
  openContextMenu: (e: Konva.KonvaEventObject<PointerEvent>) => void;
}

export const createContextMenuSlice: AppStateCreator<ContextMenuSlice> = (
  set,
  get,
) => ({
  contextMenuPos: {
    x: 0,
    y: 0,
  },
  contextMenuState: {
    isOpened: false,
    isOverElement: undefined,
  },
  openContextMenu: (e) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();

    if (stage === null) return;

    const containerRect = stage.container().getBoundingClientRect();
    const pointerPosition = stage.getPointerPosition();

    if (pointerPosition === null) return;

    e.cancelBubble = true;

    const pageOffset =
      (get().numberOfPages - 1) * SizeHelper.caluclatePageDimensions()[0];

    set(() => ({
      contextMenuState: {
        isOpened: true,
        isOverElement: isStage(e),
      },
      contextMenuPos: {
        x: containerRect.left + pointerPosition.x + 4,
        y: containerRect.top + pointerPosition.y + 4 - pageOffset,
      },
    }));
  },
  closeContextMenu: () => {
    set(() => ({
      contextMenuState: {
        isOpened: false,
      },
    }));
  },
});
