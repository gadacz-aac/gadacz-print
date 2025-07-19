type PageDimension = {
  width: number;
  height: number;
};

class PageFormat {
  public name: string;
  protected shorter: number;
  protected longer: number;

  constructor(name: string, shorter: number, longer: number) {
    this.name = name;
    this.longer = longer;
    this.shorter = shorter;
  }

  public get portait(): PageDimension {
    return { width: this.shorter, height: this.longer };
  }

  public get landscape(): PageDimension {
    return { width: this.longer, height: this.shorter };
  }
}

class DPIPageFormat extends PageFormat {
  private mmToInch = 25.4;

  constructor(name: string, shorter: number, longer: number) {
    super(name, shorter, longer);
  }

  public at(dpi: number) {
    return new PageFormat(
      this.name,
      (this.shorter / this.mmToInch) * dpi,
      (this.longer / this.mmToInch) * dpi,
    );
  }
}

export const A4 = new DPIPageFormat("a4", 595.28, 841.89);
export const PageAspectRatio = 0.7;
