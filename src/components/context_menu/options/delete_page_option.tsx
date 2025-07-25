import { useAppStore } from "../../../store/store";
import BaseContextMenuOption from "../base_context_menu_option";
import { useTranslation } from "react-i18next";
import styles from "../context_menu.module.css";

export default function DeletePageOption() {
  const { t } = useTranslation();
  const numberOfPages = useAppStore.use.numberOfPages();
  const remove = useAppStore.use.removePage();

  if (numberOfPages === 1) return null;

  return (
    <>
      <BaseContextMenuOption
        label={t("ContextMenu.Delete Page")}
        onClick={remove}
      />
      <hr className={styles.separator} />
    </>
  );
}
