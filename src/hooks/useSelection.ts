import { useState } from "react";
import Konva from "konva";
import { getClientRect, isStage } from "../helpers/konva";
import { type CommunicationSymbol } from "../types";
import useScale from "./useScale";

export const useSelection = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { WidthToA4: scale } = useScale();

  const [selectionRectangle, setSelectionRectangle] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  const handleSelect = (
    evt: Konva.KonvaEventObject<MouseEvent>,
    id: string,
  ) => {
    if (selectedIds.includes(id)) {
      return setSelectedIds((prev) => prev.filter((e) => e !== id));
    }

    if (evt.evt.ctrlKey || evt.evt.shiftKey) {
      setSelectedIds((prev) => [...prev, id]);
    } else setSelectedIds([id]);
  };

  const startSelectionRectangle = (evt: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = evt.target.getStage()?.getPointerPosition();

    if (!pos) return;

    setSelectionRectangle({
      visible: true,
      x1: pos.x,
      y1: pos.y,
      x2: pos.x,
      y2: pos.y,
    });
  };

  const resizeSelectionRectangle = (
    evt: Konva.KonvaEventObject<MouseEvent>,
  ) => {
    const pos = evt.target.getStage()?.getPointerPosition();

    if (!pos) return;

    setSelectionRectangle({
      ...selectionRectangle,
      x2: pos.x,
      y2: pos.y,
    });
  };

  const hideSelectionRectangle = (symbols: CommunicationSymbol[]) => {
    setTimeout(() => {
      setSelectionRectangle({
        ...selectionRectangle,
        visible: false,
      });
    });

    const selBox = {
      x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
      y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
      width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
      height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
    };

    const selected = symbols.filter((rect) => {
      return Konva.Util.haveIntersection(
        selBox,
        getClientRect({
          width: rect.width * scale,
          height: rect.height * scale,
          rotation: rect.rotation,
          x: rect.x * scale,
          y: rect.y * scale,
        }),
      );
    });

    setSelectedIds(selected.map((rect) => rect.id));
  };

  const handleStageClick = (evt: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectionRectangle.visible) {
      return;
    }

    if (isStage(evt)) {
      setSelectedIds([]);
      return;
    }

    if (!evt.target.hasName("symbol")) {
      return;
    }

    const clickedId = evt.target.id();

    const metaPressed = evt.evt.shiftKey || evt.evt.ctrlKey || evt.evt.metaKey;
    const isSelected = selectedIds.includes(clickedId);

    if (!metaPressed && !isSelected) {
      setSelectedIds([clickedId]);
    } else if (metaPressed && isSelected) {
      setSelectedIds(selectedIds.filter((id) => id !== clickedId));
    } else if (metaPressed && !isSelected) {
      setSelectedIds([...selectedIds, clickedId]);
    }
  };

  return {
    selectedIds,
    setSelectedIds,
    selectionRectangle,
    handleSelect,
    startSelectionRectangle,
    resizeSelectionRectangle,
    hideSelectionRectangle,
    handleStageClick,
  };
};
