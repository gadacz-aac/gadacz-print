import type { BrushData, CommunicationSymbol } from "../../types";
import ImagePicker from "./ImagePicker";
import { AacColors } from "../../consts/colors.ts";
import styles from "./Sidebar.module.css";
import { first } from "../../helpers/lists.tsx";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import Section from "./Section.tsx";
import { getGap } from "../../helpers/konva.ts";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { KeyCode } from "../../consts/key_codes.ts";

function Input({
  label,
  defaultValue,
  onChange,
  onBlur,
}: {
  label?: string;
  defaultValue: string | number | undefined;
  onChange?: (val: string) => void;
  onBlur?: (val: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (defaultValue === undefined) {
      return setValue("");
    }

    if (typeof defaultValue === "number") {
      return setValue(defaultValue.toFixed(0));
    }

    setValue(String(defaultValue));
  }, [defaultValue]);

  let inputProps = {};

  if (typeof defaultValue === "number") {
    inputProps = {
      pattern: "-?[0-9]+",
    };
  }

  function handleChange(evt: ChangeEvent<HTMLInputElement>) {
    setValue(evt.target.value);

    if (!onChange) return;

    if (Number.isNaN(Number(evt.target.value))) {
      return;
    }

    onChange(evt.target.value);
  }

  function handleBlur(evt: FocusEvent<HTMLInputElement>) {
    if (!onBlur) return;

    if (Number.isNaN(Number(evt.target.value))) {
      return;
    }

    onBlur(evt.target.value);
  }

  function handleKeyDown(evt: KeyboardEvent<HTMLInputElement>) {
    if (ref.current === null) return;

    if (evt.key !== KeyCode.Enter) return;

    ref.current.blur();
  }

  return (
    <label>
      {label}
      <input
        {...inputProps}
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={styles.searchInput}
      />
    </label>
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
  selectedSymbols: CommunicationSymbol[];
  onStyleChange: onStyleChangeFn;
  onGapChange: (gap: { x?: number; y?: number }) => void;
};

const Sidebar = ({
  onStyleChange,
  selectedSymbols,
  brushData,
  onGapChange,
}: SidebarProps) => {
  const firstSymbol = first(selectedSymbols);
  const name = selectedSymbols.length === 1 ? firstSymbol.text : brushData.text;
  const width = selectedSymbols.length === 1 ? firstSymbol.width : 100;
  const height = selectedSymbols.length === 1 ? firstSymbol.height : 100;
  const gap = getGap(selectedSymbols);

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
        <Input defaultValue={name} onChange={(e) => onStyleChange("text", e)} />
      </Section>

      <Section title={t("Layout")} grid>
        <Input
          label={t("Width")}
          defaultValue={width}
          onChange={(e) => onStyleChange("width", Number(e))}
        />
        <Input
          label={t("Height")}
          defaultValue={height}
          onChange={(e) => onStyleChange("height", Number(e))}
        />

        {selectedSymbols.length >= 2 && (
          <Input
            label={t("Gap.horizontal")}
            defaultValue={gap?.x}
            onBlur={(e) => onGapChange({ x: Number(e) })}
          />
        )}

        {selectedSymbols.length >= 2 && (
          <Input
            label={t("Gap.vertical")}
            defaultValue={gap?.y}
            onBlur={(e) => onGapChange({ y: Number(e) })}
          />
        )}
      </Section>

      <Section title={t("Stroke")}>{renderColorGrid("stroke")}</Section>

      <Section title={t("Background")}>
        {renderColorGrid("backgroundColor")}
      </Section>

      <Section title={t("Stroke Width")}>
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
