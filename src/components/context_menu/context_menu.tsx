import { useAppStore } from "../../store/store";
import styles from "./context_menu.module.css";
import useClickOutside from "../../hooks/useOnClickOutside";
import { useRef } from "react";
import DeletePageOption from "./options/delete_page_option";
import CopyOption from "./options/copy_option";
import PasteOption from "./options/paste_option";
import SelectAllOption from "./options/select_all_option";
import DuplicateOption from "./options/duplicate_option";
import DeleteElementOption from "./options/delete_element_option";
import InsertLayoutOption from "./options/insert_layout_option";

export default function ContextMenu() {
  const ref = useRef<HTMLDivElement>(null);

  const close = useAppStore.use.closeContextMenu();

  const { isOpened } = useAppStore.use.contextMenuState();
  const position = useAppStore.use.contextMenuPos();

  useClickOutside(ref, close);

  if (!isOpened) return null;

  return (
    <div
      ref={ref}
      className={styles.contextMenu}
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <DeletePageOption />
      <InsertLayoutOption />
      <DeleteElementOption />
      <SelectAllOption />
      <CopyOption />
      <DuplicateOption />
      <PasteOption />
    </div>
  );
}
