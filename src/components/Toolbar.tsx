import {
  MdAdd,
  MdAutoAwesomeMosaic,
  MdDownload,
  MdFileOpen,
  MdInsertPageBreak,
  MdSave,
} from "react-icons/md";
import styles from "./Toolbar.module.css";

type ToolbarProps = {
  onAddSymbol: () => void;
  onDownload: () => void;
  insertPageBreak: () => void;
  openLayoutsModal: () => void;
  onSave: () => void;
  onOpen: React.ChangeEventHandler<HTMLInputElement>;
};

const Toolbar = ({
  onAddSymbol,
  onDownload,
  insertPageBreak,
  openLayoutsModal,
  onSave,
  onOpen,
}: ToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <button onClick={onAddSymbol} className={styles.button}>
        <MdAdd />
      </button>
      <button onClick={openLayoutsModal} className={styles.button}>
        <MdAutoAwesomeMosaic />
      </button>
      <button onClick={insertPageBreak} className={styles.button}>
        <MdInsertPageBreak />
      </button>
      <hr />

      <button className={styles.button}>
        <label style={{ display: "inherit" }}>
          <input style={{ display: "none" }} type="file" onChange={onOpen} />
          <MdFileOpen />
        </label>
      </button>

      <button onClick={onSave} className={styles.button}>
        <MdSave />
      </button>
      <button onClick={onDownload} className={styles.button}>
        <MdDownload />
      </button>
    </div>
  );
};

export default Toolbar;
