import { useLayoutEffect, useState } from "react";
import { PageAspectRatio } from "../consts/page_format";

export default function usePageSize() {
  // set to 1 so we don't have to worry about deviding by zero when calulacting scale
  const [size, setSize] = useState([1, 1, 1]);
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
