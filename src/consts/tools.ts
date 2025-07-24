import type * as CSS from "csstype";
import {
  MdAdd,
  MdAutoAwesomeMosaic,
  MdInsertPageBreak,
  MdTextFields,
} from "react-icons/md";
import PointerIcon from "../components/icons/PointerIcon";
import { appStore } from "../store/store";

export type Tool = {
  cursor: CSS.Property.Cursor;
  title: string;
  icon: (...a: never[]) => React.ReactNode;
};

export type InsertableTool = Tool & {
  elementName: string;
};

export const isOnClickTool = (tool: Tool): tool is OnClickTool => {
  return "onClick" in tool && typeof tool.onClick === "function";
};

export type OnClickTool = Tool & {
  onClick: () => void;
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

export const InsertLayoutTool: OnClickTool = {
  cursor: "default",
  title: "Insert layout",
  icon: MdAutoAwesomeMosaic,
  onClick: () => appStore.getState().setShowLayoutModal(true),
};

export const InsertPageBreakTool: OnClickTool = {
  cursor: "default",
  title: "New page",
  icon: MdInsertPageBreak,
  onClick: () => appStore.getState().insertPageBreak(),
};

export const tools = [
  PointerTool,
  SymbolTool,
  TextTool,
  InsertLayoutTool,
  InsertPageBreakTool,
] as const;
