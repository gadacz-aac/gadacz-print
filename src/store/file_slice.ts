import { type ChangeEvent, type RefObject } from "react";
import { type AppStateCreator } from "./store";
import { extension } from "../consts/extension";
import { t } from "i18next";
import { A4 } from "../consts/page_format";
import jsPDF from "jspdf";
import type Konva from "konva";
import { PageBreakName } from "../components/PageBackground";

export interface FileSlice {
  numberOfPages: number;
  insertPageBreak: () => void;
  removePage: () => void;
  save: () => void;
  open: (evt: ChangeEvent<HTMLInputElement>) => void;
  download: (
    pageWidth: number,
    pageHeight: number,
    stageRef: RefObject<Konva.Stage | null>,
  ) => void;
}

export const createFileSlice: AppStateCreator<FileSlice> = (set, get) => ({
  numberOfPages: 1,
  insertPageBreak: () => {
    set(({ numberOfPages }) => ({
      numberOfPages: numberOfPages + 1,
    }));
  },
  removePage: () => {
    set(({ contextMenuPos, elements, numberOfPages }) => {
      return {
        elements: elements.filter((e) => {
          console.log(e.x, e.y, contextMenuPos.x, contextMenuPos.y);
          return true;
        }),
        numberOfPages: numberOfPages - 1,
      };
    });
  },
  save: () => {
    const text = JSON.stringify({
      elements: get().elements,
      numberOfPages: get().numberOfPages,
    });

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text),
    );
    element.setAttribute("download", `board${extension}`);

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

        set(() => ({
          elements: state["elements"],
          numberOfPages: state["numberOfPages"],
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
  download: (pageWidth, pageHeight, stageRef) => {
    const A4Width = A4.landscape.width;
    const A4Height = A4.landscape.height;

    const pdf = new jsPDF("l", "px", [A4Width, A4Height]);

    const stage = stageRef.current;
    if (!stage) return;

    const hideTemporarly = [
      ...stage.find(`.${PageBreakName}`),
      ...stage.find("Transformer"),
    ];
    hideTemporarly.forEach((e) => e.hide());

    for (let i = 0; i < get().numberOfPages; i++) {
      pdf.addImage(
        stage.toDataURL({
          pixelRatio: 2,
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

      if (i !== get().numberOfPages - 1) {
        pdf.addPage([A4Width, A4Height], "l");
      }
    }

    pdf.save(`canvas.${extension}`);
    hideTemporarly.forEach((e) => e.show());
  },
});
