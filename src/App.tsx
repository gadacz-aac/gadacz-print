import Konva from "konva";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Toolbar from "./components/Toolbar";
import { KeyCode } from "./consts/key_codes";
import jsPDF from "jspdf";
import { A4 } from "./consts/page_format";
import { PageBreakName } from "./components/PageBackground";
import styles from "./App.module.css";

import PredefinedLayoutsModal from "./components/modals/PredefinedLayoutsModal";
import { extension } from "./consts/extension";
import { useAppStore } from "./store/store";
import Whiteboard from "./Whiteboard";
import usePageSize from "./hooks/usePageSize";

const App = () => {
  const elements = useAppStore.use.elements();
  useAppStore.use.isResizingNewlyAddedSymbol();
  const addSymbols = useAppStore.use.addElements();
  useAppStore.use.handleDeleteSelectedSymbol();
  const setSelectedIds = useAppStore.use.setSelectedIds();
  const setTool = useAppStore.use.setTool();
  const handleCopyElements = useAppStore.use.copySelected();
  const handlePasteElements = useAppStore.use.paste();
  const handleDeleteSelectedSymbol =
    useAppStore.use.handleDeleteSelectedSymbol();

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const [pageWidth, pageHeight, sidebarWidth] = usePageSize();
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [isLayoutsModalOpen, setIsLayoutsModalOpen] = useState(false);

  useEffect(() => {
    containerRef?.current?.focus();
  }, []);

  const handleKeyDown = (evt: KeyboardEvent<HTMLElement>) => {
    if (
      "nodeName" in evt.target &&
      typeof evt.target.nodeName === "string" &&
      evt.target.nodeName.toUpperCase() === "INPUT"
    )
      return;
    if (isFinite(Number(evt.key))) {
      setTool(Number(evt.key));
    }

    if (evt.ctrlKey) {
      switch (evt.key) {
        case KeyCode.C:
          handleCopyElements();
          break;
        case KeyCode.V:
          handlePasteElements();
          break;
        case KeyCode.A:
          setSelectedIds(elements.map((e) => e.id));
          break;
        default:
          return;
      }

      return;
    }

    switch (evt.key) {
      case KeyCode.Delete:
        handleDeleteSelectedSymbol();
        setSelectedIds([]);
        break;
      default:
        return;
    }
    evt.preventDefault();
  };

  function handleDownload(): void {
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

    for (let i = 0; i < numberOfPages; i++) {
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

      if (i !== numberOfPages - 1) {
        pdf.addPage([A4Width, A4Height], "l");
      }
    }

    pdf.save(`canvas.${extension}`);
    hideTemporarly.forEach((e) => e.show());
  }

  function onSave() {
    alert("not implemented");
    // const text = JSON.stringify({ symbols, numberOfPages });
    //
    // const element = document.createElement("a");
    // element.setAttribute(
    //   "href",
    //   "data:text/plain;charset=utf-8," + encodeURIComponent(text),
    // );
    // element.setAttribute("download", `board${extension}`);
    //
    // element.style.display = "none";
    // document.body.appendChild(element);
    //
    // element.click();
    //
    // document.body.removeChild(element);
  }

  function onOpen() {
    alert("not implemented");
    // evt.preventDefault();
    // const reader = new FileReader();
    // reader.onload = async (evt) => {
    //   const text = evt.target?.result;
    //
    //   if (typeof text !== "string") {
    //     return alert("Invalid file");
    //   }
    //
    //   try {
    //     const state = await JSON.parse(text);
    //
    //     setSymbols(state["symbols"]);
    //     setNumberOfPages(state["numberOfPages"]);
    //   } catch {
    //     return alert(t("Text"));
    //   }
    // };
    //
    // if (!evt.target.files) {
    //   alert(t("No file was selected"));
    // }
    //
    // reader.readAsText(evt.target.files![0]);
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={styles.container}
    >
      <div className={styles.sidebar} style={{ width: sidebarWidth }}>
        <Sidebar />
      </div>
      <div className={styles.toolbar} style={{ translate: sidebarWidth / 2 }}>
        <Toolbar
          onDownload={handleDownload}
          insertPageBreak={() => setNumberOfPages((prev) => prev + 1)}
          openLayoutsModal={() => setIsLayoutsModalOpen(true)}
          onSave={onSave}
          onOpen={onOpen}
        />
      </div>
      <PredefinedLayoutsModal
        isOpen={isLayoutsModalOpen}
        onClose={() => setIsLayoutsModalOpen(false)}
        onSelectLayout={(layout) => {
          addSymbols(layout);
          setIsLayoutsModalOpen(false);
        }}
      />
      <Whiteboard stageRef={stageRef} numberOfPages={numberOfPages} />
    </div>
  );
};

export default App;
