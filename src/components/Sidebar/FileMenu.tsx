import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store/store";
import useClickOutside from "../../hooks/useOnClickOutside";
import styles from "./Sidebar.module.css";
import { MdMoreHoriz } from "react-icons/md";
import { extension } from "../../consts/extension";

export default function FileMenu({
  onOpen,
  onClose,
  download,
}: {
  onOpen: () => void;
  onClose: () => void;
  download: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const open = useAppStore.use.open();
  const save = useAppStore.use.save();

  useClickOutside(ref, () => {
    setIsOpen(false);
    onClose();
  });

  return (
    <div ref={ref} className={styles.fileMenu}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);

          if (isOpen) {
            onClose();
          } else {
            onOpen();
          }
        }}
        className={styles.fileMenuButton}
      >
        <MdMoreHoriz />
      </button>
      {isOpen && (
        <div className={styles.fileMenuContent}>
          <div
            className={styles.fileMenuItem}
            onClick={() => {
              window.open(window.location.href, "_blank");
              setIsOpen(false);
            }}
          >
            {t("New")}
          </div>
          <label className={styles.fileMenuItem}>
            <input
              style={{ display: "none" }}
              type="file"
              onChange={open}
              accept={extension}
            />
            {t("Open")}
          </label>
          <div
            className={styles.fileMenuItem}
            onClick={() => {
              save();
              setIsOpen(false);
            }}
          >
            {t("Save")}
          </div>
          <div
            className={styles.fileMenuItem}
            onClick={() => {
              setIsOpen(false);
              download();
            }}
          >
            {t("Download")}
          </div>

          <hr className="separator" />

          <div className={styles.fileMenuItem}>
            <a href="/docs" target="_blank">
              {t("Help")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
