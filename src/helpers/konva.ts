import type Konva from "konva";
import { type Positionable } from "../types";
import { PageBackgroundGroupName } from "../components/PageBackground";

export const degToRad = (angle: number) => (angle / 180) * Math.PI;

export const getCorner = (
  pivotX: number,
  pivotY: number,
  diffX: number,
  diffY: number,
  angle: number,
) => {
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);
  angle += Math.atan2(diffY, diffX);
  const x = pivotX + distance * Math.cos(angle);
  const y = pivotY + distance * Math.sin(angle);
  return { x, y };
};

export const getClientRect = (element: {
  x: number;
  y: number;
  height: number;
  width: number;
  rotation: number;
}) => {
  const { x, y, width, height, rotation = 0 } = element;
  const rad = degToRad(rotation);

  const p1 = getCorner(x, y, 0, 0, rad);
  const p2 = getCorner(x, y, width, 0, rad);
  const p3 = getCorner(x, y, width, height, rad);
  const p4 = getCorner(x, y, 0, height, rad);

  const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
  const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
  const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
  const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export function isStage(evt: Konva.KonvaEventObject<Event>) {
  return evt.target.hasName(PageBackgroundGroupName);
}

function getGapByAxisBetweenTwo(
  a: Positionable,
  b: Positionable,
  axis: "x" | "y",
) {
  if (b[axis] < a[axis]) {
    const buff = a;
    a = b;
    b = buff;
  }

  return (
    Math.floor(b[axis]) -
    Math.floor(a[axis]) -
    Math.floor(a[axis === "x" ? "width" : "height"])
  );
}

function getGapBetweenTwo(a: Positionable, b: Positionable) {
  return {
    x: getGapByAxisBetweenTwo(a, b, "x"),
    y: getGapByAxisBetweenTwo(a, b, "y"),
  };
}

// TODO take into account rotation
export function getGapByAxis(elements: Positionable[], axis: "x" | "y") {
  if (elements.length < 2) return;

  const sortedByAxis = elements.sort((a, b) => a[axis] - b[axis]);

  const { [axis]: consistentGap } = getGapBetweenTwo(
    sortedByAxis[0],
    sortedByAxis[1],
  );

  for (let i = 1; i < sortedByAxis.length - 1; i++) {
    const { [axis]: gap } = getGapBetweenTwo(
      sortedByAxis[i],
      sortedByAxis[i + 1],
    );

    if (gap !== consistentGap) return undefined;
  }

  return consistentGap;
}

export function getGap(elements: Positionable[]) {
  if (elements.length < 2) return;

  return {
    x: getGapByAxis(elements, "x"),
    y: getGapByAxis(elements, "y"),
  };
}
