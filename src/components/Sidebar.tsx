import type { CommunicationSymbol } from "../types";
import ImagePicker from "./ImagePicker";
import { AacColors } from "../consts/colors.ts";
import { FaSlash, FaSquare, FaSquareFull } from "react-icons/fa";
import styles from "./Sidebar.module.css";
import { first } from "../helpers/lists.tsx";
import clsx from "clsx";

function NameInput({
  name,
  setName,
}: {
  name: string;
  setName: (name: string) => void;
}) {
  return (
    <div className={styles.searchSection}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.searchInput}
      />
    </div>
  );
}

const ColorSquare = ({
  color,
  onClick,
  isSelected,
}: {
  color: string;
  onClick: () => void;
  isSelected: boolean;
}) => {
  return (
    <button
      className={clsx(styles.colorSwatch, {
        [styles.active]: isSelected,
      })}
      style={{
        backgroundColor: color,
      }}
      onClick={() => onClick()}
    />
  );
};

const strokeColors = [
  AacColors.nounOrange,
  AacColors.verbGreen,
  AacColors.negationRed,
  AacColors.prepositionPink,
  AacColors.questionPurple,
  AacColors.adverbBrown,
  AacColors.determinerGrey,
  AacColors.noColorWhite,
  AacColors.adjectiveBlue,
];

const bgColors = [
  AacColors.nounOrange,
  AacColors.verbGreen,
  AacColors.negationRed,
  AacColors.prepositionPink,
  AacColors.questionPurple,
  AacColors.adverbBrown,
  AacColors.determinerGrey,
  AacColors.noColorWhite,
  AacColors.adjectiveBlue,
];

const strokeWidths = [1, 2, 3];

export type onStyleChangeFn = <T extends keyof CommunicationSymbol>(
  property: T,
  value: CommunicationSymbol[T],
) => void;

type SidebarProps = {
  onStyleChange: onStyleChangeFn;
  selectedSymbols: CommunicationSymbol[];
};

const Sidebar = ({ onStyleChange, selectedSymbols }: SidebarProps) => {
  const name = selectedSymbols.length === 1 ? first(selectedSymbols).text : "";

  return (
    <div className={styles.sidebar}>
      <ImagePicker onStyleChange={onStyleChange} />

      <div className={styles.sectionHeader}>
        <h4>Text</h4>
      </div>
      <NameInput name={name} setName={(e) => onStyleChange("text", e)} />

      <div className={styles.sectionHeader}>
        <FaSquare style={{ marginRight: 5 }} />
        <h4>Stroke</h4>
      </div>

      <div className={styles.colorGrid}>
        {strokeColors.map((c) => (
          <ColorSquare
            key={c}
            color={c}
            isSelected={
              selectedSymbols.length === 1 &&
              first(selectedSymbols).stroke === c
            }
            onClick={() => onStyleChange("stroke", c)}
          />
        ))}
      </div>

      <div className={styles.sectionHeader}>
        <FaSquareFull style={{ marginRight: 5 }} />
        <h4>Background</h4>
      </div>

      <div className={styles.colorGrid}>
        {bgColors.map((c) => (
          <ColorSquare
            key={c}
            color={c}
            isSelected={
              selectedSymbols.length === 1 &&
              first(selectedSymbols).backgroundColor === c
            }
            onClick={() => onStyleChange("backgroundColor", c)}
          />
        ))}
      </div>

      <div className={styles.sectionHeader}>
        <FaSlash style={{ marginRight: 5 }} />
        <h4>Stroke Width</h4>
      </div>

      <div className={styles.buttonGroup}>
        {strokeWidths.map((e) => (
          <button
            key={e}
            className={clsx(styles.button, {
              [styles.active]:
                selectedSymbols.length === 1 &&
                first(selectedSymbols).strokeWidth === e,
            })}
            onClick={() => onStyleChange("strokeWidth", e)}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
