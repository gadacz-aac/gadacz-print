import { useLayoutEffect, useState } from "react";
import { PageAspectRatio } from "../consts/page_format";

export default function usePageSize() {
  const [size, setSize] = useState([0, 0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      const sidebar = 200;
      const width = window.innerWidth - 40 - sidebar;
      setSize([width, width * PageAspectRatio, sidebar]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}
