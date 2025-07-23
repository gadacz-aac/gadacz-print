import { AacColors } from "./consts/colors";

export type Positionable = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export type CanvasElement = {
  id: string;
  name: string;
} & Positionable;

export type FontData = {
  fontStyle: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  fontFamily: string;
};

export type BrushData = {
  text: string;
  image?: string;
  stroke: string;
  strokeWidth: number;
  backgroundColor: string;
  width: number;
  height: number;
};

export type CommunicationSymbol = {
  name: "symbol";
  text?: string;
} & BrushData &
  CanvasElement &
  FontData;

export type TextShape = {
  name: "text";
  text?: string;
} & CanvasElement &
  FontData &
  BrushData;

export const defaultBrush: BrushData = {
  text: "tes",
  backgroundColor: AacColors.negationRed,
  stroke: AacColors.adjectiveBlue,
  strokeWidth: 1,
  width: 100,
  height: 100,
};

export const defaultFontData: FontData = {
  fontFamily: "Arial",
  fontStyle: "400",
  fontSize: 20,
  lineHeight: 1,
};

export type CanvasShape = CommunicationSymbol | TextShape;
