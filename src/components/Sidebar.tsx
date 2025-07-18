import type { CommunicationSymbol } from "../types";
import ImagePicker from "./ImagePicker";
import { AacColors } from "../consts/colors.ts";
import { FaSlash, FaSquare, FaSquareFull } from "react-icons/fa";
import styles from "./Sidebar.module.css";
import { first } from "../helpers/lists.tsx";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import type { BrushData } from "../consts/brush.ts";
import { SiElectronfiddle } from "react-icons/si";

function NameInput({
  name,
  setName,
}: {
  name?: string;
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
  brushData: BrushData;
  onStyleChange: onStyleChangeFn;
  selectedSymbols: CommunicationSymbol[];
};

const Sidebar = ({
  onStyleChange,
  selectedSymbols,
  brushData,
}: SidebarProps) => {
  const firstSymbol = first(selectedSymbols);
  const name =
    (selectedSymbols.length === 1 && firstSymbol.text) || brushData.text;

  const { t } = useTranslation();

  function isActive<T extends keyof BrushData>(
    property: T,
    value: BrushData[T],
  ) {
    if (selectedSymbols.length === 0) return value === brushData[property];
    if (selectedSymbols.length === 1 && firstSymbol[property] === value)
      return true;

    return selectedSymbols.every((e) => e[property] === value);
  }

  return (
    <div className={styles.sidebar}>
      <ImagePicker onStyleChange={onStyleChange} />

      <div className={styles.sectionHeader}>
        <h4>{t("Text")}</h4>
      </div>
      <NameInput name={name} setName={(e) => onStyleChange("text", e)} />

      <div className={styles.sectionHeader}>
        <FaSquare style={{ marginRight: 5 }} />
        <h4>{t("Stroke")}</h4>
      </div>

      <div className={styles.colorGrid}>
        {strokeColors.map((c) => (
          <ColorSquare
            key={c}
            color={c}
            isSelected={isActive("stroke", c)}
            onClick={() => onStyleChange("stroke", c)}
          />
        ))}
      </div>

      <div className={styles.sectionHeader}>
        <FaSquareFull style={{ marginRight: 5 }} />
        <h4>{t("Background")}</h4>
      </div>

      <div className={styles.colorGrid}>
        {bgColors.map((c) => (
          <ColorSquare
            key={c}
            color={c}
            isSelected={isActive("backgroundColor", c)}
            onClick={() => onStyleChange("backgroundColor", c)}
          />
        ))}
      </div>

      <div className={styles.sectionHeader}>
        <FaSlash style={{ marginRight: 5 }} />
        <h4>{t("Stroke Width")}</h4>
      </div>

      <div className={styles.buttonGroup}>
        {strokeWidths.map((e) => (
          <button
            key={e}
            className={clsx(styles.button, {
              [styles.active]: isActive("strokeWidth", e),
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
