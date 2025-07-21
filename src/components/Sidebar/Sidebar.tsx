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
import Select from "./Select.tsx";
import FontPicker from "./FontPicker.tsx";

function Input({
  label,
  defaultValue,
  allowEmpty = false,
  placeholder,
  onChange,
  onBlur,
}: {
  label?: string;
  allowEmpty?: boolean;
  defaultValue: string | number | undefined;
  placeholder?: string;
  onChange?: (val: string) => void;
  onBlur?: (val: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const numberRegex = new RegExp(/^-?[0-9]*$/);

  useEffect(() => {
    setValue(convert(defaultValue));
  }, [defaultValue]);

  function convert(defaultValue: string | undefined | number) {
    if (defaultValue === undefined) {
      return "";
    }

    if (typeof defaultValue === "number") {
      return defaultValue.toFixed(0);
    }

    return String(defaultValue);
  }

  function assertIsValid(value: string) {
    return typeof defaultValue === "number" && Number.isNaN(Number(value));
  }

  function handleChange(evt: ChangeEvent<HTMLInputElement>) {
    if (
      typeof defaultValue === "number" &&
      !numberRegex.test(evt.target.value)
    ) {
      return;
    }

    setValue(evt.target.value);

    if (!onChange) return;

    if (assertIsValid(evt.target.value)) {
      return;
    }

    onChange(evt.target.value);
  }

  function handleBlur(evt: FocusEvent<HTMLInputElement>) {
    if (!allowEmpty && evt.target.value.trim() === "") {
      const resetValue = convert(defaultValue);

      onBlur?.(resetValue);
      onChange?.(resetValue);
      setValue(resetValue);

      return;
    }

    if (!onBlur) return;

    if (assertIsValid(evt.target.value)) {
      return;
    }

    onBlur(evt.target.value);
  }

  function handleKeyDown(evt: KeyboardEvent<HTMLInputElement>) {
    if (ref.current === null) return;

    switch (evt.key) {
      case KeyCode.Enter:
        return ref.current.blur();
    }
  }

  return (
    <label>
      {label}
      <input
        ref={ref}
        type="text"
        value={value}
        placeholder={placeholder}
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

  const fontFamily = selectedSymbols.length === 1 && firstSymbol.fontFamily;
  const fontSize = selectedSymbols.length === 1 && firstSymbol.fontSize;
  const fontWeight = selectedSymbols.length === 1 && firstSymbol.fontStyle;
  const letterSpacing =
    selectedSymbols.length === 1 && firstSymbol.letterSpacing;
  const lineHeight = selectedSymbols.length === 1 && firstSymbol.lineHeight;

  const gap = getGap(selectedSymbols);

  const { t } = useTranslation();

  const fontStyles = {
    normal: t("Font Style.Normal"),
    bold: t("Font Style.Bold"),
    italic: t("Font Style.Italic"),
    "bold italic": t("Font Style.Bold italic"),
  };

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

      <Section title={t("Text")}>
        <Input
          allowEmpty
          defaultValue={name}
          onChange={(e) => onStyleChange("text", e)}
        />
      </Section>

      {fontWeight !== false &&
        fontSize !== false &&
        lineHeight !== false &&
        letterSpacing !== false && (
          <Section title={t("Typography")} grid>
            <div style={{ gridColumn: "1/3" }}>
              <FontPicker
                onStyleChange={onStyleChange}
                currentFont={fontFamily || undefined}
              />
            </div>
            <Select
              label={t("Font Style.Font Style")}
              options={fontStyles}
              value={fontWeight ?? undefined}
              onChange={(e) => onStyleChange("fontStyle", e)}
            />
            <Input
              label={t("Font Size")}
              defaultValue={fontSize}
              onBlur={(e) => onStyleChange("fontSize", Number(e))}
            />

            <Input
              label={t("Line Height")}
              defaultValue={lineHeight}
              onBlur={(e) => onStyleChange("lineHeight", Number(e))}
            />
            <Input
              label={t("Letter Spacing")}
              defaultValue={letterSpacing}
              placeholder={t("Normal")}
              onBlur={(e) =>
                onStyleChange("letterSpacing", e === "" ? undefined : Number(e))
              }
            />
          </Section>
        )}

      <Section title={t("Layout")} grid>
        <Input
          label={t("Width")}
          defaultValue={width}
          onBlur={(e) => onStyleChange("width", Number(e))}
        />
        <Input
          label={t("Height")}
          defaultValue={height}
          onBlur={(e) => onStyleChange("height", Number(e))}
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
