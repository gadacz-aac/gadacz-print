import { type BrushData, type CanvasShape, type FontData } from "../../types";
import ImagePicker from "./ImagePicker";
import { AacColors } from "../../consts/colors.ts";
import styles from "./Sidebar.module.css";
import { first } from "../../helpers/lists.tsx";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import Section from "./Section.tsx";
import { getGap } from "../../helpers/konva.ts";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type Ref,
} from "react";
import { KeyCode } from "../../consts/key_codes.ts";
import Select from "./Select.tsx";
import FontPicker from "./FontPicker.tsx";
import { useAppStore } from "../../store/store.ts";
import useSelected from "../../hooks/useSelectedSymbols.ts";
import useStyle from "../../hooks/useStyle.ts";
import { ChromePicker } from "react-color";
import useClickOutside from "../../hooks/useOnClickOutside.ts";
import Aligment from "./Aligment.tsx";

type ColorGridProps = {
  isActive: (c: string) => boolean;
  onStyleChange: (c: string) => void;
  currentColor: string | undefined;
};

function ColorGrid({ isActive, onStyleChange, currentColor }: ColorGridProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fallback = AacColors.noColorWhite;
  const ref = useRef<HTMLDivElement>(null);
  const customColorSquareRef = useRef<HTMLButtonElement>(null);
  useClickOutside(ref, () => setShowColorPicker(false));
  const [offsetTop, setOffsetTop] = useState([0, 0]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (customColorSquareRef.current === null) return;

      const { y } = customColorSquareRef.current.getBoundingClientRect();
      const colorPickerHeight = 282;

      const isTooSmall = window.innerHeight - y < colorPickerHeight;

      const offsetTop = isTooSmall ? window.innerHeight - colorPickerHeight : y;

      setOffsetTop([offsetTop, 0]);
    };

    setTimeout(handleResize);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [customColorSquareRef]);

  const customColor =
    currentColor === undefined
      ? fallback
      : aacColors.includes(currentColor)
        ? AacColors.noColorWhite
        : currentColor;

  return (
    <div className={styles.colorGrid}>
      {aacColors.map((c) => (
        <ColorSquare
          key={c}
          color={c}
          isSelected={() => isActive(c)}
          onClick={() => onStyleChange(c)}
        />
      ))}
      <ColorSquare
        ref={customColorSquareRef}
        color={customColor}
        isSelected={() => fallback !== currentColor && isActive(customColor)}
        onClick={() => setShowColorPicker(true)}
      />
      {showColorPicker && (
        <div
          className={styles.customColorPicker}
          ref={ref}
          style={{
            transform: `translateY(${offsetTop[0]}px) translateY(${offsetTop[1]}%) translateX(100%)`,
          }}
        >
          <ChromePicker
            color={customColor}
            onChange={(c) => onStyleChange(c.hex)}
          />
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  defaultValue,
  allowEmpty = false,
  allowFloats = false,
  placeholder,
  onChange,
  onBlur,
}: {
  label?: string;
  allowEmpty?: boolean;
  allowFloats?: boolean;
  defaultValue: string | number | undefined;
  placeholder?: string;
  onChange?: (val: string) => void;
  onBlur?: (val: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const numberRegex = new RegExp(/^-?[0-9]*$/);
  const floatRegex = new RegExp(/^-?[0-9]*(\.)?([0-9]{1,2})?$/);

  const convert = useCallback(
    (defaultValue: string | undefined | number) => {
      if (defaultValue === undefined) {
        return "";
      }

      if (typeof defaultValue === "number") {
        return defaultValue.toFixed(allowFloats ? 2 : 0);
      }

      return String(defaultValue);
    },
    [allowFloats],
  );

  useEffect(() => {
    setValue(convert(defaultValue));
  }, [defaultValue, convert]);

  function assertIsValid(value: string) {
    return typeof defaultValue === "number" && Number.isNaN(Number(value));
  }

  function validateChangeForNumberInput(evt: ChangeEvent<HTMLInputElement>) {
    const regex = allowFloats ? floatRegex : numberRegex;

    return typeof defaultValue === "number" && !regex.test(evt.target.value);
  }

  function handleChange(evt: ChangeEvent<HTMLInputElement>) {
    if (validateChangeForNumberInput(evt)) {
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
  ref,
}: {
  color: string;
  onClick: () => void;
  isSelected: () => boolean;
  ref?: Ref<HTMLButtonElement | null>;
}) => {
  return (
    <button
      ref={ref}
      className={clsx(styles.colorSwatch, {
        [styles.active]: isSelected(),
      })}
      style={{
        backgroundColor: color,
      }}
      onClick={onClick}
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
  AacColors.black,
];

const strokeWidths = [1, 2, 3];

const Sidebar = () => {
  const selected = useSelected();
  const brushData = useAppStore.use.brushData();
  const fontData = useAppStore.use.fontData();
  const handleGapChange = useAppStore.use.handleGapChange();
  const styleSelected = useAppStore.use.styleSelected();
  const setBrushData = useAppStore.use.setBrushData();
  const setFontData = useAppStore.use.setFontData();

  const areOnlySymbolsSelected = selected.every(
    ({ name }) => name === "symbol",
  );

  const firstSymbol = first(selected);
  const name = selected.length === 1 ? firstSymbol.text : brushData.text;
  const width = useStyle(selected, "width", brushData.width);
  const height = useStyle(selected, "height", brushData.height);

  const fontFamily = useStyle(selected, "fontFamily", fontData.fontFamily);
  const fontSize = useStyle(selected, "fontSize", fontData.fontSize);
  const fontWeight = useStyle(selected, "fontStyle", fontData.fontStyle);
  const letterSpacing = useStyle(
    selected,
    "letterSpacing",
    fontData.letterSpacing,
  );
  const lineHeight = useStyle(selected, "lineHeight", fontData.lineHeight);

  const strokeColor = useStyle(selected, "stroke", brushData.stroke);
  const backgroundColor = useStyle(
    selected,
    "backgroundColor",
    brushData.backgroundColor,
  );
  const fontColor = useStyle(selected, "fontColor", fontData.fontColor);

  const gap = getGap(selected);

  const { t } = useTranslation();

  const fontStyles = {
    normal: t("Font Style.Normal"),
    bold: t("Font Style.Bold"),
    italic: t("Font Style.Italic"),
    "bold italic": t("Font Style.Bold italic"),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onStyleChange = (property: string, value: any) => {
    if (useAppStore.getState().selectedIds.length > 0) {
      return styleSelected(property as keyof CanvasShape, value);
    }

    setFontData(property as keyof FontData, value);
    setBrushData(property as keyof BrushData, value);
  };

  function isActive<T, K extends keyof T>(data: T, property: K, value: T[K]) {
    if (selected.length === 0) return value === data[property];
    if (selected.length === 1 && (firstSymbol as T)[property] === value)
      return true;

    return selected.every((e) => (e as T)[property] === value);
  }

  return (
    <div className={styles.sidebar}>
      <ImagePicker />

      <Section title={t("Text")}>
        <Input
          allowEmpty
          defaultValue={name}
          onChange={(e) => onStyleChange("text", e)}
        />
      </Section>

      <Section title={t("Typography")} grid>
        <div style={{ gridColumn: "1/3" }}>
          <FontPicker onStyleChange={onStyleChange} currentFont={fontFamily} />
        </div>
        <Select
          label={t("Font Style.Font Style")}
          options={fontStyles}
          value={fontWeight}
          onChange={(e) => onStyleChange("fontStyle", e)}
        />
        <Input
          label={t("Font Size")}
          defaultValue={fontSize}
          onBlur={(e) => onStyleChange("fontSize", Number(e))}
        />

        <Input
          label={t("Line Height")}
          allowFloats
          defaultValue={lineHeight}
          onBlur={(e) => {
            onStyleChange("lineHeight", Number(e));
          }}
        />
        <Input
          label={t("Letter Spacing")}
          defaultValue={letterSpacing}
          placeholder={t("Normal")}
          onBlur={(e) =>
            onStyleChange("letterSpacing", e === "" ? undefined : Number(e))
          }
        />

        <div style={{ gridColumn: "1/3", marginTop: "2px" }}>
          <ColorGrid
            currentColor={fontColor}
            isActive={(c) => isActive(fontData, "fontColor", c)}
            onStyleChange={(c) => onStyleChange("fontColor", c)}
          />
        </div>
      </Section>

      {selected.length >= 2 && <Aligment />}

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

        {selected.length >= 2 && (
          <>
            <Input
              label={t("Gap.horizontal")}
              defaultValue={gap?.x}
              onBlur={(e) => handleGapChange({ x: Number(e) })}
            />

            <Input
              label={t("Gap.vertical")}
              defaultValue={gap?.y}
              onBlur={(e) => handleGapChange({ y: Number(e) })}
            />
          </>
        )}
      </Section>

      {areOnlySymbolsSelected && (
        <>
          <Section title={t("Background")}>
            <ColorGrid
              currentColor={backgroundColor}
              isActive={(c) => isActive(brushData, "backgroundColor", c)}
              onStyleChange={(c) => onStyleChange("backgroundColor", c)}
            />
          </Section>

          <Section title={t("Stroke")}>
            <ColorGrid
              currentColor={strokeColor}
              isActive={(c) => isActive(brushData, "stroke", c)}
              onStyleChange={(c) => onStyleChange("stroke", c)}
            />
          </Section>

          <Section title={t("Stroke Width")}>
            <div className={styles.buttonGroup}>
              {strokeWidths.map((e) => (
                <button
                  key={e}
                  className={clsx(styles.colorSwatch, {
                    [styles.active]: isActive(brushData, "strokeWidth", e),
                  })}
                  onClick={() => onStyleChange("strokeWidth", e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
};

export default Sidebar;
