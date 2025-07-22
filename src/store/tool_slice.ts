import { PointerTool, tools, type Tool } from "../consts/tools";
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
      () => {
        if (typeof tool !== "number") {
          return {
            tool: tool,
          };
        }

        if (tool > tools.length) return {};

        return {
          tool: tools[tool - 1],
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
