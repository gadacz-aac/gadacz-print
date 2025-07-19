import { type CommunicationSymbol } from "../../types";
import styles from "./PredefinedLayoutsModal.module.css";
import { layouts } from "../../consts/layouts";
import LayoutPreview from "./LayoutPreview";
import { PageAspectRatio } from "../../consts/page_format";
import { useTranslation } from "react-i18next";

type PredefinedLayoutsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectLayout: (layout: CommunicationSymbol[]) => void;
};

export default function PredefinedLayoutsModal({
  isOpen,
  onClose,
  onSelectLayout,
}: PredefinedLayoutsModalProps) {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{t("Select a Predefined Layout")}</h2>
        </div>
        <div className={styles.layouts}>
          {layouts.map((layout, index) => (
            <div
              key={index}
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
          <button onClick={onClose} className={styles.closeButton}>
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
}
