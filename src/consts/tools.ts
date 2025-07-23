import type * as CSS from "csstype";
import { MdAdd, MdTextFields } from "react-icons/md";
import PointerIcon from "../components/icons/PointerIcon";

export type Tool = {
  cursor: CSS.Property.Cursor;
  title: string;
  icon: (...a: never[]) => React.ReactNode;
};

export type InsertableTool = Tool & {
  elementName: string;
};

export const PointerTool: Tool = {
  cursor: "default",
  title: "Selection",
  icon: PointerIcon,
};

export const SymbolTool: InsertableTool = {
  cursor: "crosshair",
  title: "Add Symbol",
  elementName: "symbol" as const,
  icon: MdAdd,
};

export const TextTool: InsertableTool = {
  cursor: "crosshair",
  title: "Add Text",
  elementName: "text" as const,
  icon: MdTextFields,
};

export const tools = [PointerTool, SymbolTool, TextTool] as const;
