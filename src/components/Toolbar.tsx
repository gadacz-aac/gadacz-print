import { MdDownload, MdFileOpen, MdSave } from "react-icons/md";
import styles from "./Toolbar.module.css";
import { tools } from "../consts/tools";
import { LanguagePicker } from "./LanguagePicker";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import { extension } from "../consts/extension";
import { useAppStore } from "../store/store";

type ToolbarProps = {
  onDownload: () => void;
};

const Toolbar = ({ onDownload }: ToolbarProps) => {
  const { t } = useTranslation();
  const currentTool = useAppStore.use.tool();
  const setTool = useAppStore.use.setTool();
  const open = useAppStore.use.open();
  const save = useAppStore.use.save();
  const toggleLandscape = useAppStore.use.toggleOrientation();

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

      <button title={t("Open")}>
        <label style={{ display: "inherit" }}>
          <input
            style={{ display: "none" }}
            type="file"
            onChange={open}
            accept={extension}
          />
          <MdFileOpen />
        </label>
      </button>

      <button title={t("Save")} onClick={save}>
        <MdSave />
      </button>
      <button title={t("Download")} onClick={onDownload}>
        <MdDownload />
      </button>

      <button title={t("Download")} onClick={toggleLandscape}>
        dupa
      </button>
      <hr />
      <LanguagePicker />
    </div>
  );
};

export default Toolbar;
