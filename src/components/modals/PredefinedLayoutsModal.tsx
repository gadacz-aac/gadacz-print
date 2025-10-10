import styles from "./PredefinedLayoutsModal.module.css";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import LayoutPreview from "./LayoutPreview";
import { PageAspectRatio } from "../../consts/page_format";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store/store";
import type { CommunicationSymbol } from "../../types";
import { KeyCode } from "../../consts/key_codes";

const portraitLayoutModules = import.meta.glob("/src/layouts/portrait/*.gp", {
  query: "?raw",
  import: "default",
  eager: true,
});

const landscapeLayoutModules = import.meta.glob("/src/layouts/landscape/*.gp", {
  query: "?raw",
  import: "default",
  eager: true,
});

const parseLayouts = (modules: Record<string, unknown>) =>
  Object.entries(modules)
    .map(([path, jsonString]) => {
      try {
        const parsed = JSON.parse(jsonString as string);
        return {
          layout: (parsed.elements ?? []) as CommunicationSymbol[],
          path,
        };
      } catch (e) {
        console.error(`Failed to parse layout: ${path}`, e);
        return { layout: [], path };
      }
    })
    .filter((item) => item.layout.length > 0);

const portraitLayoutsData = parseLayouts(portraitLayoutModules);
const landscapeLayoutsData = parseLayouts(landscapeLayoutModules);

type Tab = "portrait" | "landscape";

export default function PredefinedLayoutsModal() {
  const { t } = useTranslation();
  const { isOpen } = useAppStore.use.layoutModalData();
  const setShowLayoutModal = useAppStore.use.setShowLayoutModal();
  const insertLayout = useAppStore.use.insertLayout();
  const isLandscape = useAppStore.use.isLandscape();
  const [activeTab, setActiveTab] = useState<Tab>(
    isLandscape ? "landscape" : "portrait",
  );

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  });

  useEffect(() => {
    setActiveTab(isLandscape ? "landscape" : "portrait");
  }, [isLandscape]);

  function close() {
    ref.current?.blur();
    setShowLayoutModal(false);
  }

  function onSelectLayout(layout: CommunicationSymbol[]) {
    insertLayout(layout);
    close();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === KeyCode.Escape) close();

    e.stopPropagation();
  }

  if (!isOpen) {
    return null;
  }

  const layoutsData =
    activeTab === "portrait" ? portraitLayoutsData : landscapeLayoutsData;

  return (
    <div
      ref={ref}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={styles.modalOverlay}
      onClick={close}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.tabs}>
          <button
            className={activeTab === "portrait" ? styles.activeTab : ""}
            onClick={() => setActiveTab("portrait")}
          >
            {t("Portrait")}
          </button>
          <button
            className={activeTab === "landscape" ? styles.activeTab : ""}
            onClick={() => setActiveTab("landscape")}
          >
            {t("Landscape")}
          </button>
        </div>
        <div className={styles.layouts}>
          {layoutsData.map(({ layout, path }) => (
            <div
              key={path}
              className={styles.layoutTile}
              onClick={() => onSelectLayout(layout)}
            >
              <LayoutPreview
                layout={layout}
                width={150}
                isLandscape={activeTab === "landscape"}
                height={
                  activeTab === "landscape"
                    ? 150 * PageAspectRatio
                    : 150 / PageAspectRatio
                }
              />
            </div>
          ))}
        </div>
        <div className={styles.modalFooter}>
          <button onClick={close} className={styles.closeButton}>
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
}
