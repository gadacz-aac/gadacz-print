import { ErrorBoundary } from "react-error-boundary";
import ErrorBoundaryFallback from "./components/ErrorBoundaryFallback";
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
import { APP_CONTAINER_ID } from "./helpers/helpers";
import { PointerTool } from "./consts/tools";

const App = () => {
  const setSelectedIds = useAppStore.use.setSelectedIds();
  const setTool = useAppStore.use.setTool();
  const handleCopyElements = useAppStore.use.copySelected();
  const handlePasteElements = useAppStore.use.paste();
  const duplicate = useAppStore.use.duplicate();
  const selectAll = useAppStore.use.selectAll();
  const handleDeleteSelectedSymbol =
    useAppStore.use.handleDeleteSelectedSymbol();
  const download = useAppStore.use.download();
  const undo = useAppStore.use.undo();
  const redo = useAppStore.use.redo();

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const [pageWidth, pageHeight, sidebarWidth] = usePageSize();

  useEffect(() => {
    containerRef?.current?.focus();
  }, []);

  const handleBlur = () => {
    setTimeout(() => {
      document.activeElement?.addEventListener(
        "blur",
        () => {
          containerRef?.current?.focus();
        },
        { once: true },
      );
    });
  };

  const handleKeyDown = (evt: KeyboardEvent<HTMLElement>) => {
    if (
      "nodeName" in evt.target &&
      typeof evt.target.nodeName === "string" &&
      ["INPUT", "TEXTAREA"].includes(evt.target.nodeName.toUpperCase())
    ) {
      return;
    }

    if (!evt.ctrlKey && !evt.shiftKey && !Number.isNaN(Number(evt.key))) {
      setTool(Number(evt.key));
      evt.preventDefault();

      return;
    }

    if (evt.ctrlKey) {
      switch (evt.key) {
        case KeyCode.C:
          handleCopyElements();
          evt.preventDefault();
          break;
        case KeyCode.V:
          handlePasteElements();
          evt.preventDefault();
          break;
        case KeyCode.A:
          selectAll();
          evt.preventDefault();
          break;
        case KeyCode.D:
          duplicate();
          evt.preventDefault();
          break;
        case KeyCode.Z:
          if (evt.shiftKey) {
            redo();
          } else {
            undo();
          }
          evt.preventDefault();
          break;
        case KeyCode.Y:
          redo();
          evt.preventDefault();
          break;
        default:
          return;
      }

      return;
    }

    switch (evt.key) {
      case KeyCode.Escape:
        if (useAppStore.getState().tool !== PointerTool) {
          setTool(PointerTool);
        } else {
          setSelectedIds([]);
        }

        evt.preventDefault();
        break;
      case KeyCode.Delete:
        handleDeleteSelectedSymbol();
        setSelectedIds([]);
        evt.preventDefault();
        break;
      default:
        return;
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <div
        id={APP_CONTAINER_ID}
        ref={containerRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        onBlur={handleBlur}
        className={styles.container}
      >
        <div className={styles.toolbar} style={{ translate: sidebarWidth / 2 }}>
          <Toolbar
            onDownload={() => download(pageWidth, pageHeight, stageRef)}
          />
        </div>

        <PredefinedLayoutsModal />
        <Whiteboard stageRef={stageRef} />
        <ContextMenu />

        <div className={styles.sidebar} style={{ width: sidebarWidth }}>
          <Sidebar />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
