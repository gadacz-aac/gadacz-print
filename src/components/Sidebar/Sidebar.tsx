import type { BrushData, CommunicationSymbol } from "../../types";
import ImagePicker from "./ImagePicker";
import { AacColors } from "../../consts/colors.ts";
import { FaSlash, FaSquare, FaSquareFull } from "react-icons/fa";
import styles from "./Sidebar.module.css";
import { first } from "../../helpers/lists.tsx";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import Section from "./Section.tsx";

function Input({
  value,
  setValue,
}: {
  value: string;
  setValue: (name: string) => void;
}) {
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
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

const aacColors = [
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
  const name = selectedSymbols.length === 1 ? firstSymbol.text : brushData.text;
  const width =
    selectedSymbols.length === 1 ? firstSymbol.width.toFixed(0) : 100;
  const height =
    selectedSymbols.length === 1 ? firstSymbol.height.toFixed(0) : 100;

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

  const renderColorGrid = (property: "stroke" | "backgroundColor") => (
    <div className={styles.colorGrid}>
      {aacColors.map((c) => (
        <ColorSquare
          key={c}
          color={c}
          isSelected={isActive(property, c)}
          onClick={() => onStyleChange(property, c)}
        />
      ))}
    </div>
  );

  return (
    <div className={styles.sidebar}>
      <ImagePicker onStyleChange={onStyleChange} />

      <Section title={t("Properties")}>
        <Input value={name} setValue={(e) => onStyleChange("text", e)} />
        <Input
          value={width.toString()}
          setValue={(e) => onStyleChange("width", Number(e))}
        />
        <Input
          value={height.toString()}
          setValue={(e) => onStyleChange("height", Number(e))}
        />
      </Section>

      <Section
        title={t("Stroke")}
        icon={<FaSquare style={{ marginRight: 5 }} />}
      >
        {renderColorGrid("stroke")}
      </Section>

      <Section
        title={t("Background")}
        icon={<FaSquareFull style={{ marginRight: 5 }} />}
      >
        {renderColorGrid("backgroundColor")}
      </Section>

      <Section
        title={t("Stroke Width")}
        icon={<FaSlash style={{ marginRight: 5 }} />}
      >
        <div className={styles.buttonGroup}>
          {strokeWidths.map((e) => (
            <button
              key={e}
              className={clsx(styles.colorSwatch, {
                [styles.active]: isActive("strokeWidth", e),
              })}
              onClick={() => onStyleChange("strokeWidth", e)}
            >
              {e}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default Sidebar;
