import { A4, PageAspectRatio } from "../consts/page_format";

export default class SizeHelper {
  static padding = 10;
  static gap = 20;

  static calculatePageDimensions(landscape: boolean): [number, number, number] {
    const sidebar = 200;
    const availWidth =
      window.innerWidth - this.padding * 2 - this.gap - sidebar;
    const availHeight = window.innerHeight - this.padding * 2;

    const ratio = landscape ? PageAspectRatio : 1 / PageAspectRatio;

    let width = availWidth;
    let height = width * ratio;

    if (height > availHeight) {
      height = availHeight;
      width = height / ratio;
    }

    return [width, height, sidebar];
  }

  static calculateScale(width: number, landscape: boolean) {
    const orientation = landscape ? "landscape" : "portrait";

    const A4ToWidth = A4[orientation].width / width;
    const WidthToA4 = width / A4[orientation].width;

    return {
      A4ToWidth,
      WidthToA4,
    };
  }
}
