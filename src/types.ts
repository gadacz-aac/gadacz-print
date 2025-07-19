import { AacColors } from "./consts/colors";
import { defaultHeight, defaultWidth } from "./consts/symbol";

export type Positionable = {
  x: number;
  y: number;
  width: number;
  height: number;
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
  id: string;
  name: "symbol";
  text?: string;
  rotation: number;
} & BrushData &
  Positionable;

export const defaultBrush: BrushData = {
  text: "",
  backgroundColor: AacColors.negationRed,
  stroke: AacColors.adjectiveBlue,
  strokeWidth: 1,
  width: defaultWidth,
  height: defaultHeight,
};
