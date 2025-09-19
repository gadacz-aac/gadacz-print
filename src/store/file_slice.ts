import { type ChangeEvent, type RefObject } from "react";
import { type AppStateCreator } from "./store";
import { extension } from "../consts/extension";
import { t } from "i18next";
import { A4 } from "../consts/page_format";
import jsPDF from "jspdf";
import type Konva from "konva";
import { PageBreakName } from "../components/PageBackground";
import SizeHelper from "../helpers/sizing";
import { fileNameTranslated } from "../helpers/helpers";

const BOARD_FILE_VERSION = 1;

export interface FileSlice {
  fileName: string;
  setFileName: (fileName: string) => void;
  numberOfPages: number;
  insertPageBreak: () => void;
  removePage: () => void;
  save: () => void;
  open: (evt: ChangeEvent<HTMLInputElement>) => void;
  download2: (
    pageWidth: number,
    pageHeight: number,
    stageRef: RefObject<Konva.Stage | null>,
  ) => void;
  download: (
    pageWidth: number,
    pageHeight: number,
    stageRef: RefObject<Konva.Stage | null>,
  ) => void;
}

export const createFileSlice: AppStateCreator<FileSlice> = (set, get) => ({
  fileName: "",
  setFileName: (fileName: string) => set(() => ({ fileName })),
  numberOfPages: 1,
  insertPageBreak: () => {
    set(({ numberOfPages }) => ({
      numberOfPages: numberOfPages + 1,
    }));
  },
  removePage: () => {
    set(({ contextMenuPos, elements, numberOfPages }) => {
      if (contextMenuPos.pageNumber === undefined) return {};
      if (numberOfPages === 1) return {};

      const [width, height] = SizeHelper.caluclatePageDimensions(
        get().isLandscape,
      );
      const scale = SizeHelper.calculateScale(width, get().isLandscape);
      const pageYStart = height * contextMenuPos.pageNumber;
      const pageYEnd = height * (contextMenuPos.pageNumber + 1);

      return {
        elements: elements
          .filter((e) => {
            const yStart = e.y * scale.WidthToA4;
            const yEnd = yStart + e.height * scale.WidthToA4;
            const remove =
              yStart > pageYStart &&
              yStart < pageYEnd &&
              yEnd > pageYStart &&
              yEnd < pageYEnd;

            return !remove;
          })
          .map((e) => {
            const yStart = e.y * scale.WidthToA4;
            const yEnd = yStart + e.height * scale.WidthToA4;

            const shift = yEnd > pageYEnd;
            if (!shift) return e;

            return {
              ...e,
              y: e.y - height * scale.A4ToWidth,
            };
          }),
        numberOfPages: numberOfPages - 1,
      };
    });
  },
  save: () => {
    const text = JSON.stringify({
      version: BOARD_FILE_VERSION,
      isLandscape: get().isLandscape,
      elements: get().elements,
      numberOfPages: get().numberOfPages,
    });

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text),
    );
    element.setAttribute(
      "download",
      `${fileNameTranslated(get().fileName)}${extension}`,
    );

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  },
  open: (evt: ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result;

      if (typeof text !== "string") {
        return alert("Invalid file");
      }

      try {
        const state = await JSON.parse(text);

        if (state.version !== BOARD_FILE_VERSION) {
          return;
        }

        set(() => ({
          elements: state["elements"],
          numberOfPages: state["numberOfPages"],
          isLandscape: state["isLandscape"],
        }));
      } catch {
        return alert(t("Text"));
      }
    };

    if (!evt.target.files) {
      alert(t("No file was selected"));
    }

    reader.readAsText(evt.target.files![0]);
  },
  download2: async (pageWidth, pageHeight, stageRef) => {
    const isLandscape = get().isLandscape;

    const orientation = isLandscape ? "landscape" : "portrait";

    const A4Width = A4[orientation].width;
    const A4Height = A4[orientation].height;

    const pdf = new jsPDF(orientation, "px", [A4Width, A4Height]);

    const stage = stageRef.current;
    if (!stage) return;

    const hideTemporarly = [
      ...stage.find(`.${PageBreakName}`),
      ...stage.find("Transformer"),
    ];
    hideTemporarly.forEach((e) => e.hide());

    const dupa = stage.toCanvas().cloneNode();

    document.body.append(dupa);

    const offset = (
      stage.toCanvas().cloneNode() as HTMLCanvasElement
    ).transferControlToOffscreen();

    // const pixelRatio = Math.min(10_000 / pageWidth, 10_000 / pageHeight);

    console.time();
    for (let i = 0; i < get().numberOfPages; i++) {
      const w = new Worker(
        new URL("/src/worker/download_worker.js", import.meta.url),
      );

      const message = new Promise((resolve) => {
        w.onmessage = async (e) => {
          pdf.addImage(e.data.dataUrl, 0, 0, A4Width, A4Height);
          resolve(e.data.dataUrl);
        };
      });

      w.postMessage({ canvas: offset, pageHeight, pageWidth, pageIndex: i }, [
        offset,
      ]);

      const image = new Image();
      image.src = (await message) as string;

      const win = window.open("");
      win!.document.write(image.outerHTML);

      if (i !== get().numberOfPages - 1) {
        pdf.addPage([A4Width, A4Height], orientation);
      }
    }

    console.timeEnd();
    pdf.save(`${fileNameTranslated(get().fileName)}.pdf`);
    hideTemporarly.forEach((e) => e.show());
  },
  download: (pageWidth, pageHeight, stageRef) => {
    const isLandscape = get().isLandscape;

    const orientation = isLandscape ? "landscape" : "portrait";

    const A4Width = A4[orientation].width;
    const A4Height = A4[orientation].height;

    const pdf = new jsPDF(orientation, "px", [A4Width, A4Height]);

    const stage = stageRef.current;
    if (!stage) return;

    const hideTemporarly = [
      ...stage.find(`.${PageBreakName}`),
      ...stage.find("Transformer"),
    ];
    hideTemporarly.forEach((e) => e.hide());

    for (let i = 0; i < get().numberOfPages - 1; i++) {
      pdf.addPage([A4Width, A4Height], orientation);
    }

    const pixelRatio = Math.min(A4Width / pageWidth, A4Height / pageHeight) * 4;

    console.log(pixelRatio);

    for (let i = 0; i < get().numberOfPages; i++) {
      pdf.addImage(
        stage.toDataURL({
          pixelRatio,
          x: 0,
          y: i * pageHeight,
          width: pageWidth,
          height: pageHeight,
        }),
        0,
        0,
        A4Width,
        A4Height,
      );
    }

    pdf.save(`${fileNameTranslated(get().fileName)}.pdf`);
    hideTemporarly.forEach((e) => e.show());
  },
});
