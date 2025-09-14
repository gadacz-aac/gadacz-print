import type { CanvasShape } from "../types";

export const APP_CONTAINER_ID = "APP_CONTAINER_ID";

export const focusMainContainer = () => {
  console.log(document.querySelector<HTMLElement>("#" + APP_CONTAINER_ID));
  document.querySelector<HTMLElement>("#" + APP_CONTAINER_ID)?.focus();
};

export const isEmpty = (dupa: string | Array<unknown>) => {
  if (Array.isArray(dupa)) return dupa.length === 0;

  return dupa.trim().length === 0;
};

const getConsistentGap = (numbers: number[]): number | undefined => {
  if (numbers.length === 0) return 0;

  const roundedNumbers = numbers.map((num) => Math.round(num));
  const uniqueGaps = [...new Set(roundedNumbers)];

  if (uniqueGaps.length === 1) {
    return uniqueGaps[0];
  }

  return undefined;
};

export const determineGridGaps = (shapes: CanvasShape[]) => {
  if (shapes.length < 2) {
    return { rowGap: 0, columnGap: 0 };
  }

  const rowGaps: number[] = [];
  const columnGaps: number[] = [];

  // Group by rows to find elements in multi-element rows
  const rows = new Map<number, CanvasShape[]>();
  shapes.forEach((s) => {
    const key = Math.round(s.y / 5);
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key)!.push(s);
  });

  let elementsInMultiElementRows = 0;
  rows.forEach((row) => {
    if (row.length > 1) {
      elementsInMultiElementRows += row.length;
    }
  });

  // Group by columns to find elements in multi-element columns
  const cols = new Map<number, CanvasShape[]>();
  shapes.forEach((s) => {
    const key = Math.round(s.x / 5);
    if (!cols.has(key)) cols.set(key, []);
    cols.get(key)!.push(s);
  });

  let elementsInMultiElementCols = 0;
  cols.forEach((col) => {
    if (col.length > 1) {
      elementsInMultiElementCols += col.length;
    }
  });

  // Calculate row gaps
  const shapesSortedByRow = [...shapes].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 5) return a.y - b.y;
    return a.x - b.x;
  });

  for (let i = 0; i < shapesSortedByRow.length - 1; i++) {
    const current = shapesSortedByRow[i];
    const next = shapesSortedByRow[i + 1];

    if (Math.abs(current.y - next.y) < 5) {
      const gap = next.x - (current.x + current.width);
      if (gap > 0) {
        rowGaps.push(gap);
      }
    }
  }

  // Calculate column gaps
  const shapesSortedByColumn = [...shapes].sort((a, b) => {
    if (Math.abs(a.x - b.x) > 5) return a.x - b.x;
    return a.y - b.y;
  });

  for (let i = 0; i < shapesSortedByColumn.length - 1; i++) {
    const current = shapesSortedByColumn[i];
    const next = shapesSortedByColumn[i + 1];

    if (Math.abs(current.x - next.x) < 5) {
      const gap = next.y - (current.y + current.height);
      if (gap > 0) {
        columnGaps.push(gap);
      }
    }
  }

  let consistentRowGap = getConsistentGap(rowGaps);
  if (
    consistentRowGap !== undefined &&
    elementsInMultiElementRows < shapes.length
  ) {
    consistentRowGap = undefined;
  }

  let consistentColumnGap = getConsistentGap(columnGaps);
  if (
    consistentColumnGap !== undefined &&
    elementsInMultiElementCols < shapes.length
  ) {
    consistentColumnGap = undefined;
  }

  return {
    rowGap: consistentRowGap,
    columnGap: consistentColumnGap,
  };
};
