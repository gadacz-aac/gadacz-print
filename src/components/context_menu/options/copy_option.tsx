import { useTranslation } from "react-i18next";
import { useAppStore } from "../../../store/store";
import BaseContextMenuOption from "../base_context_menu_option";

export default function CopyOption() {
  const { t } = useTranslation();
  const { isOverElement } = useAppStore.use.contextMenuState();
  const { length } = useAppStore.use.selectedIds();
  const copySelected = useAppStore.use.copySelected();

  const shouldShow = isOverElement || length > 0;

  if (!shouldShow) return null;

  return (
    <BaseContextMenuOption
      label={t("ContextMenu.Copy")}
      shortcut="Ctrl + C"
      onClick={copySelected}
    />
  );
}
