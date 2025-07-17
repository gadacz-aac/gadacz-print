import type * as CSS from "csstype";

export type Tool = {
  cursor: CSS.Property.Cursor;
};

export const PointerTool: Tool = {
  cursor: "default",
};

export const SymbolTool: Tool = {
  cursor: "crosshair",
};
