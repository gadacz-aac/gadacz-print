import { AacColors } from "./colors";

export type BrushData = {
  text: string;
  image?: string;
  stroke: string;
  strokeWidth: number;
  backgroundColor: string;
};

export const defaultBrush: BrushData = {
  text: "",
  backgroundColor: AacColors.negationRed,
  stroke: AacColors.adjectiveBlue,
  strokeWidth: 1,
};
