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
import { useTranslation } from "react-i18next";
import { APP_CONTAINER_ID, FILE_INPUT_ID } from "./helpers/helpers";
import { PointerTool } from "./consts/tools";
import Snackbar from "./components/Snackbar/Snackbar";
import { extension } from "./consts/extension";

const App = () => {
  const { t } = useTranslation();
  const setSelectedIds = useAppStore.use.setSelectedIds();
  const setTool = useAppStore.use.setTool();
  const handleCopyElements = useAppStore.use.copySelected();
  const handlePasteElements = useAppStore.use.paste();
  const duplicate = useAppStore.use.duplicate();
  const selectAll = useAppStore.use.selectAll();
  const handleDeleteSelectedSymbol =
    useAppStore.use.handleDeleteSelectedSymbol();
  const download = useAppStore.use.download();
  const { undo, redo } = useAppStore.temporal.getState();
  const snackbar = useAppStore.use.snackbar();
  const hideSnackbar = useAppStore.use.hideSnackbar();

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const [, , sidebarWidth] = usePageSize();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = t("confirmLeave");
      return t("confirmLeave");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [t]);

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
        case KeyCode.A:
          selectAll();
          evt.preventDefault();
          break;
        case KeyCode.C:
          handleCopyElements();
          evt.preventDefault();
          break;
        case KeyCode.D:
          duplicate();
          evt.preventDefault();
          break;
        case KeyCode.E:
          download(stageRef);
          evt.preventDefault();
          break;
        case KeyCode.N:
          window.open(window.location.href, "_blank");
          evt.preventDefault();
          break;
        case KeyCode.S:
          useAppStore.getState().save();
          evt.preventDefault();
          break;
        case KeyCode.O:
          useAppStore.getState().open();
          evt.preventDefault();
          break;
        case KeyCode.V:
          handlePasteElements();
          evt.preventDefault();
          break;
        case KeyCode.Y:
          redo();
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
          <Toolbar />
        </div>

        <PredefinedLayoutsModal />
        <div className={styles.whiteboard}>
          <Whiteboard stageRef={stageRef} />
        </div>
        <ContextMenu />

        <div className={styles.sidebar} style={{ width: sidebarWidth }}>
          <Sidebar download={() => download(stageRef)} />
        </div>
        {snackbar.open && snackbar.message && (
          <Snackbar message={snackbar.message} onClose={hideSnackbar} />
        )}

        <input
          id={FILE_INPUT_ID}
          style={{ display: "none" }}
          type="file"
          accept={extension}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
