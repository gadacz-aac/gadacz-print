import { type CommunicationSymbol } from "../../types";
import styles from "./PredefinedLayoutsModal.module.css";
import { layouts } from "../../consts/layouts";
import LayoutPreview from "./LayoutPreview";
import { PageAspectRatio } from "../../consts/page_format";

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
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Select a Predefined Layout</h2>
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
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
