import { A4, PageAspectRatio } from "../consts/page_format";

export default class SizeHelper {
  static caluclatePageDimensions() {
    const sidebar = 200;
    const width = window.innerWidth - 40 - sidebar;

    return [width, width * PageAspectRatio, sidebar];
  }

  static calculateScale(width: number) {
    const A4ToWidth = A4.landscape.width / width;
    const WidthToA4 = width / A4.landscape.width;

    return {
      A4ToWidth,
      WidthToA4,
    };
  }
}
