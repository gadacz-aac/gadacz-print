import type { CommunicationSymbol } from "../types";
import ImagePicker from "./ImagePicker";
import { AacColors } from "../consts/colors.ts";
import { FaSlash, FaSquare, FaSquareFull } from "react-icons/fa";
import styles from "./Sidebar.module.css";

const ColorSquare = ({
  color,
  onClick,
}: {
  color: string;
  onClick: () => void;
}) => {
  return (
    <button
      className={styles.colorSquare}
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
};

const Sidebar = ({ onStyleChange }: SidebarProps) => {
  return (
    <div className={styles.sidebar}>
      <ImagePicker onStyleChange={onStyleChange} />

      <div className={styles.sectionHeader}>
        <FaSquare style={{ marginRight: 5 }} />
        <h4>Stroke</h4>
      </div>

      <div className={styles.colorGrid}>
        {strokeColors.map((c) => (
          <ColorSquare
            key={c}
            color={c}
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
            onClick={() => onStyleChange("backgroundColor", c)}
          />
        ))}
      </div>

      <div className={styles.sectionHeader}>
        <FaSlash style={{ marginRight: 5 }} />
        <h4>Stroke Width</h4>
      </div>

      <div className={styles.strokeWidthButtons}>
        {strokeWidths.map((e) => (
          <button
            key={e}
            className={styles.strokeWidthButton}
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
