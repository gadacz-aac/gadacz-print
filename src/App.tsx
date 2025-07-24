import Konva from "konva";
import { useEffect, useRef, type KeyboardEvent } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Toolbar from "./components/Toolbar";
import { KeyCode } from "./consts/key_codes";
import styles from "./App.module.css";

import PredefinedLayoutsModal from "./components/modals/PredefinedLayoutsModal";
import { useAppStore } from "./store/store";
import Whiteboard from "./Whiteboard";
import usePageSize from "./hooks/usePageSize";
import ContextMenu from "./components/context_menu/context_menu";

const App = () => {
  const elements = useAppStore.use.elements();
  useAppStore.use.isResizingNewlyAddedSymbol();
  useAppStore.use.handleDeleteSelectedSymbol();
  const setSelectedIds = useAppStore.use.setSelectedIds();
  const setTool = useAppStore.use.setTool();
  const handleCopyElements = useAppStore.use.copySelected();
  const handlePasteElements = useAppStore.use.paste();
  const handleDeleteSelectedSymbol =
    useAppStore.use.handleDeleteSelectedSymbol();
  const download = useAppStore.use.download();

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const [pageWidth, pageHeight, sidebarWidth] = usePageSize();

  useEffect(() => {
    containerRef?.current?.focus();
  }, []);

  const handleKeyDown = (evt: KeyboardEvent<HTMLElement>) => {
    if (
      "nodeName" in evt.target &&
      typeof evt.target.nodeName === "string" &&
      ["INPUT", "TEXTAREA"].includes(evt.target.nodeName.toUpperCase())
    )
      return;
    if (!Number.isNaN(Number(evt.key))) {
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
        <Toolbar onDownload={() => download(pageWidth, pageHeight, stageRef)} />
      </div>
      <PredefinedLayoutsModal />
      <Whiteboard stageRef={stageRef} />
      <ContextMenu />
    </div>
  );
};

export default App;
