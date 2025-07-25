import { useAppStore } from "../../../store/store";
import BaseContextMenuOption from "../base_context_menu_option";
import { useTranslation } from "react-i18next";

export default function SelectAllOption() {
  const { t } = useTranslation();

  const { length } = useAppStore.use.elements();
  const selectAll = useAppStore.use.selectAll();

  return (
    <BaseContextMenuOption
      label={t("ContextMenu.Select All")}
      disabled={length === 0}
      shortcut="Ctrl + A"
      onClick={selectAll}
    />
  );
}
