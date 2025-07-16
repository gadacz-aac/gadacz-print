import { useLayoutEffect, useState } from "react";
import { PageAspectRatio } from "../consts/page_format";

export default function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      const width = window.innerWidth - 40;
      setSize([width, width * PageAspectRatio]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}

