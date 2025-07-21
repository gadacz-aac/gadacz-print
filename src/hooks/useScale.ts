import { A4 } from "../consts/page_format";
import usePageSize from "./usePageSize";

export default function useScale() {
  const [width] = usePageSize();

  const A4ToWidth = A4.landscape.width / width;
  const WidthToA4 = width / A4.landscape.width;
  return {
    A4ToWidth,
    WidthToA4,
  };
}

export type Scale = ReturnType<typeof useScale>;
