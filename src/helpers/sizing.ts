import { A4, PageAspectRatio } from "../consts/page_format";

export default class SizeHelper {
  static padding = 10;
  static gap = 20;

  static caluclatePageDimensions(landscape: boolean) {
    const sidebar = 200;
    const width = window.innerWidth - this.padding * 2 - this.gap - sidebar;

    if (landscape) {
      const maxHeight = width * PageAspectRatio;

      const diff = window.innerHeight - this.padding * 2 - maxHeight;

      if (diff < 0) {
        const height = maxHeight + diff;

        return [height / PageAspectRatio, height, sidebar];
      }

      return [width, maxHeight, sidebar];
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
