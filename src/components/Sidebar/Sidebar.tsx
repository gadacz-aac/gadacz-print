import { type BrushData, type CanvasShape, type FontData } from "../../types";
import ImagePicker from "./ImagePicker";
import { AacColors } from "../../consts/colors.ts";
import styles from "./Sidebar.module.css";
import { first } from "../../helpers/lists.tsx";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import Section from "./Section.tsx";
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
import { extension } from "../../consts/extension";
import { useAppStore } from "../../store/store.ts";
import useSelected from "../../hooks/useSelectedSymbols.ts";
import useStyle from "../../hooks/useStyle.ts";
import { ChromePicker } from "react-color";
import useClickOutside from "../../hooks/useOnClickOutside.ts";
import Aligment from "./Aligment.tsx";
import Switch from "../Switch/Switch.tsx";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import GapSection from "./GapSection.tsx";
import { MdMoreHoriz } from "react-icons/md";
import { fileNameTranslated } from "../../helpers/helpers.ts";

type ColorGridProps = {
  isActive: (c: string) => boolean;
  onStyleChange: (c: string) => void;
  currentColor: string | undefined;
};

function ColorGrid({ isActive, onStyleChange, currentColor }: ColorGridProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fallback = AacColors.noColorWhite;
  const pickerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  useClickOutside(pickerRef, () => setShowColorPicker(false));
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    const scrollContainer = gridRef.current?.closest(
      "[data-overlayscrollbars-contents]",
    );

    const updatePosition = () => {
      if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        const pickerHeight = pickerRef.current?.offsetHeight ?? 245;
        const paddingBottom = 12;
        const paddingLeft = 12;
        let top = rect.top;

        if (top < paddingBottom) {
          top = paddingBottom;
        } else if (top + pickerHeight > window.innerHeight - paddingBottom) {
          top = Math.max(
            paddingBottom,
            window.innerHeight - pickerHeight - paddingBottom,
          );
        }

        setPickerPos({ top, left: rect.right + paddingLeft });
      }
    };

    if (showColorPicker) {
      updatePosition();
      scrollContainer?.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      scrollContainer?.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showColorPicker]);

  const customColor =
    currentColor === undefined
      ? fallback
      : aacColors.includes(currentColor)
        ? AacColors.noColorWhite
        : currentColor;

  return (
    <div className={styles.colorGrid} ref={gridRef}>
      {aacColors.map((c) => (
        <ColorSquare
          key={c}
          color={c}
          isSelected={() => isActive(c)}
          onClick={() => onStyleChange(c)}
        />
      ))}
      <ColorSquare
        color={customColor}
        isSelected={() => fallback !== currentColor && isActive(customColor)}
        onClick={() => setShowColorPicker(true)}
      />
      {showColorPicker && (
        <div
          ref={pickerRef}
          style={{
            position: "fixed",
            top: pickerPos.top,
            left: pickerPos.left,
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
  className,
}: {
  label?: string;
  allowEmpty?: boolean;
  allowFloats?: boolean;
  defaultValue: string | number | undefined;
  placeholder?: string;
  onChange?: (val: string) => void;
  onBlur?: (val: string) => void;
  className?: string;
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
        className={clsx(styles.searchInput, className)}
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

type SidebarProps = {
  onDownload: () => void;
};

function FileMenu({
  onDownload,
  open,
  save,
  onOpen,
  onClose,
}: SidebarProps & {
  open: (e: ChangeEvent<HTMLInputElement>) => void;
  save: () => void;
  onOpen: () => void;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => {
    setIsOpen(false);
    onClose();
  });

  return (
    <div ref={ref} className={styles.fileMenu}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);

          if (isOpen) {
            onClose();
          } else {
            onOpen();
          }
        }}
        className={styles.fileMenuButton}
      >
        <MdMoreHoriz />
      </button>
      {isOpen && (
        <div className={styles.fileMenuContent}>
          <div
            className={styles.fileMenuItem}
            onClick={() => {
              window.open(window.location.href, "_blank");
              setIsOpen(false);
            }}
          >
            {t("New")}
          </div>
          <label className={styles.fileMenuItem}>
            <input
              style={{ display: "none" }}
              type="file"
              onChange={open}
              accept={extension}
            />
            {t("Open")}
          </label>
          <div
            className={styles.fileMenuItem}
            onClick={() => {
              save();
              setIsOpen(false);
            }}
          >
            {t("Save")}
          </div>
          <div
            className={styles.fileMenuItem}
            onClick={() => {
              onDownload();
              setIsOpen(false);
            }}
          >
            {t("Download")}
          </div>

          <hr className="separator" />

          <div className={styles.fileMenuItem}>
            <a href="/docs" target="_blank">
              {t("Help")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

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

const Sidebar = ({ onDownload }: SidebarProps) => {
  const [showScrollbars, setShowScrollbar] = useState(true);

  const selected = useSelected();
  const brushData = useAppStore.use.brushData();
  const fontData = useAppStore.use.fontData();
  const styleSelected = useAppStore.use.styleSelected();
  const setBrushData = useAppStore.use.setBrushData();
  const setFontData = useAppStore.use.setFontData();
  const fileName = fileNameTranslated(useAppStore.use.fileName());
  const setFileName = useAppStore.use.setFileName();
  const open = useAppStore.use.open();
  const save = useAppStore.use.save();

  const areOnlySymbolsSelected = selected.every(
    ({ name }) => name === "symbol",
  );

  const firstSymbol = first(selected);
  const name = selected.length === 1 ? firstSymbol.text : brushData.text;
  const width = useStyle(selected, "width", brushData.width);
  const textOverImage =
    useStyle(selected, "textOverImage", brushData.textOverImage) ?? false;
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

  const borderRadius = useStyle(
    selected,
    "borderRadius",
    brushData.borderRadius,
  );

  const fontColor = useStyle(selected, "fontColor", fontData.fontColor);

  const paddingX = useStyle(selected, "paddingX", brushData.paddingX);
  const paddingY = useStyle(selected, "paddingY", brushData.paddingY);

  const { t } = useTranslation();

  const fontStyles = {
    normal: t("Font Style.Normal"),
    bold: t("Font Style.Bold"),
    italic: t("Font Style.Italic"),
    "bold italic": t("Font Style.Bold italic"),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onStyleChange = (property: keyof CanvasShape, value: any) => {
    if (useAppStore.getState().selectedIds.length > 0) {
      return styleSelected(property, value);
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
    <OverlayScrollbarsComponent
      options={{
        scrollbars: {
          visibility: showScrollbars ? "visible" : "hidden",
          autoHide: "move",
        },
      }}
      element="div"
      className={styles.sidebar}
    >
      <Section>
        <div className={styles.fileSection}>
          <Input
            defaultValue={fileName}
            onBlur={(e) => setFileName(e)}
            className={styles.hiddenInput}
          />
          <FileMenu
            onOpen={() => setShowScrollbar(false)}
            onClose={() => setShowScrollbar(true)}
            onDownload={onDownload}
            open={open}
            save={save}
          />
        </div>
      </Section>

      <ImagePicker />

      <Section title={t("Text")}>
        <Input
          label="Podpis"
          allowEmpty
          defaultValue={name}
          onChange={(e) => onStyleChange("text", e)}
        />
        {areOnlySymbolsSelected && (
          <Switch
            label={t("Display Text Over Image")}
            value={textOverImage}
            onChange={(e) => onStyleChange("textOverImage", e)}
          />
        )}
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

        {selected.length >= 2 && <GapSection />}
      </Section>

      {areOnlySymbolsSelected && (
        <Section grid title={t("Padding")}>
          <Input
            defaultValue={paddingX}
            onBlur={(e) => onStyleChange("paddingX", Number(e))}
          />
          <Input
            defaultValue={paddingY}
            onBlur={(e) => onStyleChange("paddingY", Number(e))}
          />
        </Section>
      )}

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

          <Section title={t("Border Radius")}>
            <Input
              defaultValue={borderRadius}
              onBlur={(e) => onStyleChange("borderRadius", Number(e))}
            />
          </Section>
        </>
      )}
    </OverlayScrollbarsComponent>
  );
};

export default Sidebar;
