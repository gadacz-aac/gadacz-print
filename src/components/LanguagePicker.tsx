import { useTranslation } from "react-i18next";
import styles from "./LanguagePicker.module.css";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "pl", name: "Polski" },
];

export const LanguagePicker = () => {
  const { i18n } = useTranslation();

  const handleChangeLanguage = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className={styles.container}>
      <select onChange={handleChangeLanguage} value={i18n.language}>
        {LANGUAGES.map(({ code, name }) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

