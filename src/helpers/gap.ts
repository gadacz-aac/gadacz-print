import type { CanvasShape } from "../types";

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

const findGridLines = (shapes: CanvasShape[], axis: "x" | "y"): number[] => {
  if (shapes.length === 0) {
    return [];
  }

  const positions = shapes.map((s) => s[axis]).sort((a, b) => a - b);

  const clusters: number[][] = [];
  let currentCluster: number[] = [positions[0]];

  for (let i = 1; i < positions.length; i++) {
    if (positions[i] - currentCluster[currentCluster.length - 1] < 50) {
      // merge threshold
      currentCluster.push(positions[i]);
    } else {
      clusters.push(currentCluster);
      currentCluster = [positions[i]];
    }
  }
  clusters.push(currentCluster);

  return clusters.map(
    (cluster) => cluster.reduce((a, b) => a + b, 0) / cluster.length,
  );
};

const findClosest = (value: number, array: number[]): number => {
  if (array.length === 0) return value;
  return array.reduce((prev, curr) => {
    return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
  });
};

const snapToGrid = (
  shapes: CanvasShape[],
  xGridLines: number[],
  yGridLines: number[],
): CanvasShape[] => {
  return shapes.map((shape) => ({
    ...shape,
    x: findClosest(shape.x, xGridLines),
    y: findClosest(shape.y, yGridLines),
  }));
};

export const modifiedPositionByAxisAndGap = (
  selected: CanvasShape[],
  gap: number,
  axis: "x" | "y",
): CanvasShape[] => {
  if (selected.length < 2) {
    return selected;
  }

  const yGridLines = findGridLines(selected, "y");
  const xGridLines = findGridLines(selected, "x");
  console.log(xGridLines, yGridLines);

  const snappedShapes = snapToGrid(selected, xGridLines, yGridLines);

  if (axis === "x") {
    // Sort by y, then x to process row by row
    const sorted = [...snappedShapes].sort((a, b) => {
      if (Math.abs(a.y - b.y) > 10) return a.y - b.y;
      return a.x - b.x;
    });

    const rows = new Map<number, CanvasShape[]>();
    sorted.forEach((s) => {
      const rowKey = Math.round(s.y / 10);
      if (!rows.has(rowKey)) rows.set(rowKey, []);
      rows.get(rowKey)!.push(s);
    });

    const newShapes = new Map<string, CanvasShape>();
    snappedShapes.forEach((s) => newShapes.set(s.id, s));

    rows.forEach((row) => {
      for (let i = 1; i < row.length; i++) {
        const prev = newShapes.get(row[i - 1].id)!;
        const current = newShapes.get(row[i].id)!;
        const newX = prev.x + prev.width + gap;
        newShapes.set(current.id, { ...current, x: newX });
      }
    });
    return Array.from(newShapes.values());
  } else {
    // axis === 'y'
    // Sort by x, then y to process column by column
    const sorted = [...snappedShapes].sort((a, b) => {
      if (Math.abs(a.x - b.x) > 10) return a.x - b.x;
      return a.y - b.y;
    });

    const cols = new Map<number, CanvasShape[]>();
    sorted.forEach((s) => {
      const colKey = Math.round(s.x / 10);
      if (!cols.has(colKey)) cols.set(colKey, []);
      cols.get(colKey)!.push(s);
    });

    const newShapes = new Map<string, CanvasShape>();
    snappedShapes.forEach((s) => newShapes.set(s.id, s));

    cols.forEach((col) => {
      for (let i = 1; i < col.length; i++) {
        const prev = newShapes.get(col[i - 1].id)!;
        const current = newShapes.get(col[i].id)!;
        const newY = prev.y + prev.height + gap;
        newShapes.set(current.id, { ...current, y: newY });
      }
    });
    return Array.from(newShapes.values());
  }
};

