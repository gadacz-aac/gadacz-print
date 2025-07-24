import { useTranslation } from "react-i18next";
import { useAppStore } from "../../../store/store";
import BaseContextMenuOption from "../base_context_menu_option";

export default function CopyOption() {
  const { t } = useTranslation();
  const { isOverElement } = useAppStore.use.contextMenuState();
  const copySelected = useAppStore.use.copySelected();

  if (isOverElement) return null;

  return (
    <BaseContextMenuOption
      label={t("ContextMenu.Copy")}
      onClick={copySelected}
    />
  );
}
