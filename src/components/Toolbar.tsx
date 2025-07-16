import {
  MdAdd,
  MdAutoAwesomeMosaic,
  MdDownload,
  MdInsertPageBreak,
} from "react-icons/md";
import styles from "./Toolbar.module.css";

type ToolbarProps = {
  onAddSymbol: () => void;
  onDownload: () => void;
  insertPageBreak: () => void;
};

const Toolbar = ({
  onAddSymbol,
  onDownload,
  insertPageBreak,
}: ToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <button onClick={onAddSymbol} className={styles.button}>
        <MdAdd />
      </button>
      <button className={styles.button}>
        <MdAutoAwesomeMosaic />
      </button>
      <button onClick={insertPageBreak} className={styles.button}>
        <MdInsertPageBreak />
      </button>
      <button onClick={onDownload} className={styles.button}>
        <MdDownload />
      </button>
    </div>
  );
};

export default Toolbar;
