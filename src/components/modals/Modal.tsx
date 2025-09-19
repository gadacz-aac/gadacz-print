import styles from "./Modal.module.css";
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { KeyCode } from "../../consts/key_codes";
import { useTranslation } from "react-i18next";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: Props) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.focus();
    } else {
      ref.current?.blur();
    }
  }, [isOpen]);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === KeyCode.Escape) {
      onClose();
    }

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
      onClick={onClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
        </div>
        <div className={styles.modalBody}>{children}</div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeButton}>
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
}