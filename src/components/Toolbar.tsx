import { FaPlus, FaLayerGroup } from "react-icons/fa";
import styles from "./Toolbar.module.css";

type ToolbarProps = {
  onAddSymbol: () => void;
};

const Toolbar = ({ onAddSymbol }: ToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <button onClick={onAddSymbol} className={styles.button}>
        <FaPlus color="#333" />
      </button>
      <button className={styles.button}>
        <FaLayerGroup color="#333" />
      </button>
    </div>
  );
};

export default Toolbar;
