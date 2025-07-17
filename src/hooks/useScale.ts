import { A4 } from "../consts/page_format";
import usePageSize from "./usePageSize";

export default function useScale() {
  const [width] = usePageSize();

  return [A4.landscape.width / width, width / A4.landscape.width];
}
