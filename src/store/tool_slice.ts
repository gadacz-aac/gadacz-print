import { isOnClickTool, PointerTool, tools, type Tool } from "../consts/tools";
import { type AppStateCreator } from "./store";

export interface ToolSlice {
  tool: Tool;
  toolIsInProgress: boolean;
  setTool: (tool: number | Tool) => void;
  setToolInProgress: (isInProgess: boolean) => void;
}

export const createToolSlice: AppStateCreator<ToolSlice> = (set) => ({
  tool: PointerTool,
  toolIsInProgress: false,
  setTool: (tool) => {
    set(
      ({ tool: oldTool }) => {
        let newTool: Tool;

        if (typeof tool !== "number") {
          newTool = tool;
        } else {
          if (tool === 0 || tool > tools.length) return {};
          newTool = tools[tool - 1];
        }

        if (isOnClickTool(newTool)) {
          newTool.onClick();
          newTool = oldTool;
        }

        return {
          tool: newTool,
        };
      },
      undefined,
      "tool/setTool",
    );
  },
  setToolInProgress: (isInProgress) => {
    set(() => ({
      toolIsInProgress: isInProgress,
    }));
  },
});
