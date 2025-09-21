import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { KeyCode } from "../../consts/key_codes";
import styles from "./Sidebar.module.css";

export default function Input({
  label,
  isEmpty = false,
  defaultValue,
  allowEmpty = false,
  allowFloats = false,
  placeholder,
  onChange,
  onBlur,
}: {
  label?: string;
  isEmpty?: boolean;
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
    setValue(convert(isEmpty ? undefined : defaultValue));
  }, [defaultValue, isEmpty, convert]);

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
