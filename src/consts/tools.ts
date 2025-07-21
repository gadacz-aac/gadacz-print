import type * as CSS from "csstype";
import { MdAdd } from "react-icons/md";
import PointerIcon from "../components/icons/PointerIcon";

export type Tool = {
  cursor: CSS.Property.Cursor;
  title: string;
  icon: (...a: never[]) => React.ReactNode;
};

export const PointerTool: Tool = {
  cursor: "default",
  title: "Selection",
  icon: PointerIcon,
};

export const SymbolTool: Tool = {
  cursor: "crosshair",
  title: "Add Symbol",
  icon: MdAdd,
};

export const tools = [PointerTool, SymbolTool];
