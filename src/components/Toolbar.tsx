import styles from "./Toolbar.module.css";
import { tools } from "../consts/tools";
import { LanguagePicker } from "./LanguagePicker";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/store";
import { MdRedo, MdUndo } from "react-icons/md";

const Toolbar = () => {
  const { t } = useTranslation();
  const currentTool = useAppStore.use.tool();
  const setTool = useAppStore.use.setTool();
  const { undo, redo } = useAppStore.temporal.getState();

  return (
    <div className={styles.toolbar}>
      {tools.map((tool, idx) => (
        <button
          key={tool.title}
          title={t(tool.title as never)}
          onClick={() => setTool(tool)}
          className={clsx({
            active: currentTool === tool,
          })}
        >
          {tool.icon()}

          <span className={styles.shortcut}>{idx + 1}</span>
        </button>
      ))}
      <hr />

      <button title={t("Undo")} onClick={() => undo()}>
        <MdUndo />
      </button>

      <button title={t("Redo")} onClick={() => redo()}>
        <MdRedo />
      </button>
      <hr />
      <LanguagePicker />
    </div>
  );
};

export default Toolbar;
