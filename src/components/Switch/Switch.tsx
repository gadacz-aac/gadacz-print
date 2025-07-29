import React from "react";
import styles from "./Switch.module.css";

interface SwitchProps {
  value: boolean;
  label: string;
  onChange: (value: boolean) => void;
}

export default function Switch({ value, label, onChange }: SwitchProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <label className={styles.label}>
      {label}
      <label className={styles.switch}>
        <input type="checkbox" checked={value} onChange={handleChange} />
        <span className={styles.slider}></span>
      </label>
    </label>
  );
}
