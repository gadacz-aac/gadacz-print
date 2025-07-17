import type * as CSS from "csstype";

export type CommunicationSymbol = {
  id: string;
  name: "symbol";
  text?: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  image?: string;
  stroke: string;
  strokeWidth: number;
  backgroundColor?: string;
};

export type Tool = {
  cursor: CSS.Property.Cursor;
};
