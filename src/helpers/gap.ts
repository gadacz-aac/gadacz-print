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

  const consistentRowGap = getConsistentGap(rowGaps);
  const consistentColumnGap = getConsistentGap(columnGaps);

  return {
    rowGap: consistentRowGap,
    columnGap: consistentColumnGap,
  };
};

export const findGridLines = (
  shapes: CanvasShape[],
  axis: "x" | "y",
): number[] => {
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
  gapValue: number,
  axis: "x" | "y",
): CanvasShape[] => {
  if (selected.length < 2) {
    return selected;
  }

  // 1. Determine both gaps. The one not being changed is preserved.
  const currentGaps = determineGridGaps(selected);
  const rowGap = axis === "x" ? gapValue : currentGaps.rowGap ?? 0;
  const columnGap = axis === "y" ? gapValue : currentGaps.columnGap ?? 0;

  // 2. Establish grid structure
  const yGridLines = findGridLines(selected, "y");
  const xGridLines = findGridLines(selected, "x");
  const snappedShapes = snapToGrid(selected, xGridLines, yGridLines);

  // 3. Organize shapes into a logical grid
  const grid = new Map<number, Map<number, CanvasShape>>(); // y-key -> x-key -> shape
  const rowYKeys = new Set<number>();
  const colXKeys = new Set<number>();

  snappedShapes.forEach((s) => {
    if (!grid.has(s.y)) {
      grid.set(s.y, new Map());
    }
    grid.get(s.y)!.set(s.x, s);
    rowYKeys.add(s.y);
    colXKeys.add(s.x);
  });

  const sortedRows = [...rowYKeys].sort((a, b) => a - b);
  const sortedCols = [...colXKeys].sort((a, b) => a - b);

  // 4. Calculate max width for each column and max height for each row
  const colWidths = new Map<number, number>();
  sortedCols.forEach((x) => {
    let maxWidth = 0;
    sortedRows.forEach((y) => {
      const shape = grid.get(y)?.get(x);
      if (shape && shape.width > maxWidth) {
        maxWidth = shape.width;
      }
    });
    colWidths.set(x, maxWidth);
  });

  const rowHeights = new Map<number, number>();
  sortedRows.forEach((y) => {
    let maxHeight = 0;
    sortedCols.forEach((x) => {
      const shape = grid.get(y)?.get(x);
      if (shape && shape.height > maxHeight) {
        maxHeight = shape.height;
      }
    });
    rowHeights.set(y, maxHeight);
  });

  // 5. Calculate new positions for columns and rows
  const newColX = new Map<number, number>();
  if (sortedCols.length > 0) {
    let currentX = sortedCols[0]; // Keep original position of first column
    for (let i = 0; i < sortedCols.length; i++) {
      const xKey = sortedCols[i];
      newColX.set(xKey, currentX);
      const width = colWidths.get(xKey) ?? 0;
      currentX += width + rowGap;
    }
  }

  const newRowY = new Map<number, number>();
  if (sortedRows.length > 0) {
    let currentY = sortedRows[0]; // Keep original position of first row
    for (let i = 0; i < sortedRows.length; i++) {
      const yKey = sortedRows[i];
      newRowY.set(yKey, currentY);
      const height = rowHeights.get(yKey) ?? 0;
      currentY += height + columnGap;
    }
  }

  // 6. Apply new positions
  const originalShapesById = new Map(selected.map((s) => [s.id, s]));
  const finalShapes: CanvasShape[] = [];

  snappedShapes.forEach((snapped) => {
    const newX = newColX.get(snapped.x);
    const newY = newRowY.get(snapped.y);
    const originalShape = originalShapesById.get(snapped.id);

    if (newX !== undefined && newY !== undefined && originalShape) {
      finalShapes.push({ ...originalShape, x: newX, y: newY });
    } else if (originalShape) {
      finalShapes.push(originalShape); // Failsafe
    }
  });

  return finalShapes;
};