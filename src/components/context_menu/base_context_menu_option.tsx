import clsx from "clsx";
import styles from "./context_menu.module.css";
import { useAppStore } from "../../store/store";

type ContextMenuOptionProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
};

export default function BaseContextMenuOption({
  label,
  disabled = false,
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
    </button>
  );
}
