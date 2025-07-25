import { useAppStore } from "../../../store/store";
import BaseContextMenuOption from "../base_context_menu_option";
import { useTranslation } from "react-i18next";

export default function DeleteElementOption() {
  const { t } = useTranslation();
  const { isOverElement } = useAppStore.use.contextMenuState();
  const { length } = useAppStore.use.selectedIds();
  const remove = useAppStore.use.handleDeleteSelectedSymbol();

  const shouldShow = isOverElement || length > 0;

  if (!shouldShow) return null;

  return (
    <BaseContextMenuOption
      label={t("ContextMenu.Delete")}
      shortcut="Del"
      onClick={remove}
    />
  );
}
