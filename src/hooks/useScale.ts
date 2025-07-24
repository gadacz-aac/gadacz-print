import SizeHelper from "../helpers/sizing";
import usePageSize from "./usePageSize";

export default function useScale() {
  const [width] = usePageSize();

  return SizeHelper.calculateScale(width);
}

export type Scale = ReturnType<typeof useScale>;
