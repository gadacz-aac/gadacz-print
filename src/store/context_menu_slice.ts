import type Konva from "konva";
import { type AppStateCreator } from "./store";
import { isStage } from "../helpers/konva";
import SizeHelper from "../helpers/sizing";

export interface ContextMenuSlice {
  contextMenuPos: {
    x: number;
    y: number;
    pageNumber?: number;
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

    const scrollTop =
      document.querySelector("div:has(> .konvajs-content)")?.scrollTop ?? 0;

    const pageNumber = Math.floor(
      pointerPosition.y / SizeHelper.caluclatePageDimensions()[1],
    );

    set(() => ({
      contextMenuState: {
        isOpened: true,
        isOverElement: isStage(e),
      },
      contextMenuPos: {
        x: containerRect.left + pointerPosition.x + 4,
        y: containerRect.top + pointerPosition.y + 4 - scrollTop,
        pageNumber,
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
