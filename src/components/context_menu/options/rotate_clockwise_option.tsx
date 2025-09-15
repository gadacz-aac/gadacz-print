import { useAppStore } from "../../../store/store";
import BaseContextMenuOption from "../base_context_menu_option";
import { useTranslation } from "react-i18next";

export default function RotateClockwiseOption() {
  const { t } = useTranslation();
  const rotatePage = useAppStore.use.rotatePage();
  const close = useAppStore.use.closeContextMenu();

  const handleClick = () => {
    rotatePage(true);
    close();
  };

  return (
    <BaseContextMenuOption
      onClick={handleClick}
      label={t("ContextMenu.Rotate Clockwise")}
    />
  );
}
