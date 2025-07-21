import {
  MdAutoAwesomeMosaic,
  MdDownload,
  MdFileOpen,
  MdInsertPageBreak,
  MdSave,
} from "react-icons/md";
import styles from "./Toolbar.module.css";
import { tools } from "../consts/tools";
import { LanguagePicker } from "./LanguagePicker";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import { extension } from "../consts/extension";
import { useAppStore } from "../store/store";

type ToolbarProps = {
  onDownload: () => void;
  insertPageBreak: () => void;
  openLayoutsModal: () => void;
  onSave: () => void;
  onOpen: React.ChangeEventHandler<HTMLInputElement>;
};

const Toolbar = ({
  onDownload,
  insertPageBreak,
  openLayoutsModal,
  onSave,
  onOpen,
}: ToolbarProps) => {
  const { t } = useTranslation();
  const currentTool = useAppStore.use.tool();
  const setTool = useAppStore.use.setTool();

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
      <button title={t("Insert layout")} onClick={openLayoutsModal}>
        <MdAutoAwesomeMosaic />
      </button>
      <button title={t("New page")} onClick={insertPageBreak}>
        <MdInsertPageBreak />
      </button>
      <hr />

      <button title={t("Open")}>
        <label style={{ display: "inherit" }}>
          <input
            style={{ display: "none" }}
            type="file"
            onChange={onOpen}
            accept={extension}
          />
          <MdFileOpen />
        </label>
      </button>

      <button title={t("Save")} onClick={onSave}>
        <MdSave />
      </button>
      <button title={t("Download")} onClick={onDownload}>
        <MdDownload />
      </button>
      <hr />
      <LanguagePicker />
    </div>
  );
};

export default Toolbar;
