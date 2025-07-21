import type * as CSS from "csstype";
import { useEffect, useState } from "react";
import { useAppStore } from "../store/store";
import { PointerTool } from "../consts/tools";

export default function useCursor() {
  const [cursor, setCursor] = useState<CSS.Property.Cursor>("default");
  const tool = useAppStore.use.tool();

  useEffect(() => {
    setCursor(tool.cursor);
  }, [tool]);

  return [
    cursor,
    (cursor: CSS.Property.Cursor) => {
      if (tool === PointerTool) {
        setCursor(cursor);
      }
    },
  ] as const;
}
