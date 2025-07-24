import { useLayoutEffect, useState } from "react";
import SizeHelper from "../helpers/sizing";

export default function usePageSize() {
  // set to 1 so we don't have to worry about deviding by zero when calulacting scale
  const [size, setSize] = useState([1, 1, 1]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize(SizeHelper.caluclatePageDimensions());
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}
