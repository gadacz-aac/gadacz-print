import { A4, PageAspectRatio } from "../consts/page_format";

export default class SizeHelper {
  static caluclatePageDimensions(landscape: boolean) {
    const sidebar = 200;
    const width = window.innerWidth - 40 - sidebar;

    if (landscape) {
      return [width, width * PageAspectRatio, sidebar];
    }

    return [width * PageAspectRatio, width, sidebar];
  }

  static calculateScale(width: number, landscape: boolean) {
    const orientation = landscape ? "landscape" : "portait";

    const A4ToWidth = A4[orientation].width / width;
    const WidthToA4 = width / A4[orientation].width;

    return {
      A4ToWidth,
      WidthToA4,
    };
  }
}
