import SizeHelper from "../helpers/sizing";
import { useAppStore } from "../store/store";
import usePageSize from "./usePageSize";

export default function useScale() {
  const [width] = usePageSize();
  const isLandscape = useAppStore.use.isLandscape();

  return SizeHelper.calculateScale(width, isLandscape);
}

export type Scale = ReturnType<typeof useScale>;
