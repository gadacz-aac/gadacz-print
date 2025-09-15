# Grid Gap Functionality Documentation

This document explains the technical details of how the grid gap calculation and adjustment functionality works in the application.

## Overview

The grid gap feature allows users to inspect and modify the spacing between elements on the canvas. The system is designed to work with elements arranged in a grid-like structure, even if they are not perfectly aligned. The core logic is encapsulated in two main functions found in `@src/helpers/gap.ts`:

1.  `determineGridGaps`: Calculates the existing row and column gaps of the selected elements.
2.  `modifiedPositionByAxisAndGap`: Repositions the selected elements to conform to a new specified gap, laying out the entire grid.

## Gap Calculation (`determineGridGaps`)

This function is responsible for calculating the horizontal (`rowGap`) and vertical (`columnGap`) gaps from a given array of selected shapes. It is designed to be lenient and find a consistent gap if one exists, even among a few elements in the selection.

### Key Steps:

1.  **Sort and Scan:** It sorts the selected shapes twice: once by row (y then x) and once by column (x then y).
2.  **Gap Measurement:** It iterates through the sorted lists and measures the distance between each adjacent pair of elements on the primary axis.
3.  **Consistency Check:** It uses the `getConsistentGap` helper to check if all the measured gaps (for a given axis) are the same (within a rounding tolerance). If a consistent gap is found, it is returned; otherwise, it returns `undefined`.

## Gap Adjustment (`modifiedPositionByAxisAndGap`)

This function takes a selection of shapes, a new gap value, and an axis (`'x'` or `'y'`) and returns a new array of shapes repositioned into a complete grid.

### Key Steps:

1.  **Determine Both Gaps:** The function first establishes the gaps for both axes. The axis being modified (`'x'` or `'y'`) receives the new `gapValue` from the user. The gap for the *other* axis is preserved by calling `determineGridGaps` to get its current value. If no consistent gap is found for the other axis, a default of `0` is used.

2.  **Grid Structure Detection (`findGridLines` & `snapToGrid`):** The core "snap-to-grid" feature first identifies the most probable row and column lines from the selected elements using a clustering algorithm (`findGridLines`). Each selected element is then "snapped" to the nearest identified grid line on both axes (`snapToGrid`). This creates a perfectly aligned temporary grid to work with, establishing the topology (which row/column each element belongs to).

3.  **Calculate Cell Dimensions:** The function calculates the maximum width of all elements within each column and the maximum height of all elements within each row. This ensures that the new grid layout will accommodate elements of different sizes without overlap.

4.  **Full Grid Repositioning:** The function calculates the final `x` and `y` position for every element. It iterates through the grid's rows and columns, placing each element based on the accumulated widths/heights of the preceding cells plus the desired horizontal and vertical gaps. The entire grid is laid out from the top-left.

5.  **Apply New Positions:** The newly calculated positions are applied to the original shapes, preserving their other properties.

## UI Integration (`GapSection.tsx`)

The UI component in `@src/components/Sidebar/GapSection.tsx` orchestrates this functionality:

1.  It uses the `useSelected` hook to get the currently selected elements.
2.  It calls `determineGridGaps` to find the current gaps.
3.  The returned gap values are displayed in the input fields. If a gap is `undefined` (because it's inconsistent), the input field shows a default value (e.g., 0).
4.  When a user enters a new value in an input and it loses focus (`onBlur`), the `handleGapChange` function from the `elements_slice` is called, which in turn uses the `modifiedPositionByAxisAndGap` helper to calculate and apply the new positions.