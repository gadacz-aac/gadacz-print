import { useAppStore } from "../../../store/store";
import BaseContextMenuOption from "../base_context_menu_option";
import { useTranslation } from "react-i18next";
import styles from "../context_menu.module.css";

export default function InsertLayoutOption() {
  const { t } = useTranslation();
  const showModal = useAppStore.use.setShowLayoutModal();
  const { pageNumber } = useAppStore.use.contextMenuPos();

  console.log(pageNumber);

  return (
    <>
      <BaseContextMenuOption
        label={t("Insert layout")}
        onClick={() => showModal(true, pageNumber!)}
      />

      <hr className={styles.separator} />
    </>
  );
}
