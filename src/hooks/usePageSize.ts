import { useLayoutEffect, useState } from "react";
import SizeHelper from "../helpers/sizing";
import { useAppStore } from "../store/store";

export default function usePageSize() {
  // set to 1 so we don't have to worry about deviding by zero when calulacting scale
  const [size, setSize] = useState([1, 1, 1]);
  const isLandscape = useAppStore.use.isLandscape();
  useLayoutEffect(() => {
    function updateSize() {
      setSize(SizeHelper.caluclatePageDimensions(isLandscape));
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [isLandscape]);

  return size;
}
