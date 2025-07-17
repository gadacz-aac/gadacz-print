import type * as CSS from "csstype";

export type CommunicationSymbol = {
  id: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  image?: string;
  stroke: string;
  strokeWidth: number;
  backgroundColor?: string;
  name: "symbol";
};

export type Tool = {
  cursor: CSS.Property.Cursor;
};
