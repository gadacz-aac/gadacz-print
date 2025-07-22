import styles from "./Sidebar.module.css";

export default function Select({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: { [key: string]: string } | string[];
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  if (Array.isArray(options)) {
    options = options.reduce((prev, cur) => ({ ...prev, [cur]: cur }), {});
  }

  return (
    <label>
      {label}
      <select
        value={value}
        onChange={(evt) => onChange(evt.target.value)}
        className={styles.searchInput}
      >
        {Object.entries(options).map(([value, label], index) => (
          <option key={index} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
