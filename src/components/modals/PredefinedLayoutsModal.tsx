import styles from "./PredefinedLayoutsModal.module.css";
import { useEffect, useRef, type KeyboardEvent } from "react";
import LayoutPreview from "./LayoutPreview";
import { PageAspectRatio } from "../../consts/page_format";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store/store";
import type { CommunicationSymbol } from "../../types";
import { KeyCode } from "../../consts/key_codes";

const layoutModules = import.meta.glob("/src/layouts/*.gp", {
  as: "raw",
  eager: true,
});
const layoutsData = Object.entries(layoutModules)
  .map(([path, jsonString]) => {
    try {
      const parsed = JSON.parse(jsonString);
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

export default function PredefinedLayoutsModal() {
  const { t } = useTranslation();
  const { isOpen } = useAppStore.use.layoutModalData();
  const setShowLayoutModal = useAppStore.use.setShowLayoutModal();
  const insertLayout = useAppStore.use.insertLayout();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  });

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

  return (
    <div
      ref={ref}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={styles.modalOverlay}
      onClick={close}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{t("Select a Predefined Layout")}</h2>
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
                height={150 * PageAspectRatio}
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
