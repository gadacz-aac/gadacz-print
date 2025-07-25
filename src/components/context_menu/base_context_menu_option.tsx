import clsx from "clsx";
import styles from "./context_menu.module.css";
import { useAppStore } from "../../store/store";

type ContextMenuOptionProps = {
  label: string;
  disabled?: boolean;
  shortcut?: string;
  onClick: () => void;
};

export default function BaseContextMenuOption({
  label,
  disabled = false,
  shortcut,
  onClick,
}: ContextMenuOptionProps) {
  const hide = useAppStore.use.closeContextMenu();

  return (
    <button
      className={clsx(styles.contextMenuItem, {
        [styles.contextMenuItemDisabled]: disabled,
      })}
      disabled={disabled}
      key={label}
      onClick={() => {
        hide();
        onClick();
      }}
    >
      {label}

      {shortcut && (
        <>
          <div style={{ width: "10px", margin: "auto" }}></div>
          <span className={styles.contextMenuItemShotcut}>{shortcut}</span>
        </>
      )}
    </button>
  );
}
