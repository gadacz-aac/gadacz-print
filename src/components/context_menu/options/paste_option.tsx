import { useAppStore } from "../../../store/store";
import BaseContextMenuOption from "../base_context_menu_option";
import { useTranslation } from "react-i18next";

export default function PasteOption() {
  const { t } = useTranslation();

  const { length } = useAppStore.use.copied();
  const paste = useAppStore.use.paste();

  return (
    <BaseContextMenuOption
      disabled={length === 0}
      label={t("ContextMenu.Paste")}
      shortcut="Ctrl + V"
      onClick={paste}
    />
  );
}
