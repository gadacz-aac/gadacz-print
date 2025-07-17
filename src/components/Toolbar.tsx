import {
  MdAdd,
  MdAutoAwesomeMosaic,
  MdDownload,
  MdFileOpen,
  MdInsertPageBreak,
  MdSave,
} from "react-icons/md";
import styles from "./Toolbar.module.css";
import { PointerTool, SymbolTool, type Tool } from "../consts/tools";
import { clsx } from "clsx";
import { extension } from "../consts/extension";

type ToolbarProps = {
  tool: Tool;
  onPointer: () => void;
  onAddSymbol: () => void;
  onDownload: () => void;
  insertPageBreak: () => void;
  openLayoutsModal: () => void;
  onSave: () => void;
  onOpen: React.ChangeEventHandler<HTMLInputElement>;
};

const Toolbar = ({
  onPointer,
  onAddSymbol,
  onDownload,
  insertPageBreak,
  openLayoutsModal,
  onSave,
  onOpen,
  tool,
}: ToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <button
        title="Selection"
        onClick={onPointer}
        className={clsx({
          active: tool === PointerTool,
        })}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="1rem"
          viewBox="0 -960 960 960"
          width="1rem"
          fill="currentColor"
        >
          <path d="m320-410 79-110h170L320-716v306ZM551-80 406-392 240-160v-720l560 440H516l144 309-109 51ZM399-520Z" />
        </svg>
      </button>
      <button
        title="Add Symbol"
        onClick={onAddSymbol}
        className={clsx({
          active: tool === SymbolTool,
        })}
      >
        <MdAdd />
      </button>
      <button title="Insert layout" onClick={openLayoutsModal}>
        <MdAutoAwesomeMosaic />
      </button>
      <button title="New page" onClick={insertPageBreak}>
        <MdInsertPageBreak />
      </button>
      <hr />

      <button title="Open">
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

      <button title="Save" onClick={onSave}>
        <MdSave />
      </button>
      <button title="Download" onClick={onDownload}>
        <MdDownload />
      </button>
    </div>
  );
};

export default Toolbar;
