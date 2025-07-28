import { useEffect, useState } from "react";
import styles from "./ImagePicker.module.css";
import sidebarStyles from "./Sidebar.module.css";
import { useTranslation } from "react-i18next";
import Section from "./Section";
import { useAppStore } from "../../store/store";
import { type CanvasShape } from "../../types";

type ArasaacPictogram = {
  _id: number;
  keywords: string[];
};

const ImagePicker = () => {
  const addSymbols = useAppStore.use.addElements();
  const onStyleChange = useAppStore.use.styleSelected();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ArasaacPictogram[]>([]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const abortController = new AbortController();

    const handler = setTimeout(async () => {
      if (!searchTerm) return;

      try {
        const response = await fetch(
          `https://api.arasaac.org/v1/pictograms/${i18n.language}/search/${searchTerm}`,
          { signal: abortController.signal },
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
      abortController.abort();
    };
  }, [i18n, searchTerm]);

  const handleImageChange = (value: string) => {
    if (useAppStore.getState().selectedIds.length !== 0) {
      return onStyleChange("image" as keyof CanvasShape, value);
    }

    const symbol = {
      ...useAppStore.getState().brushData,
      ...useAppStore.getState().fontData,
      image: value,
      x: 0,
      y: 0,
      rotation: 0,
      name: "symbol" as const,
    };

    addSymbols([symbol]);
  };

  const handleLocalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) return;

        handleImageChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Section title={t("Image")}>
      <div className={styles.imagePicker}>
        <div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={sidebarStyles.searchInput}
            placeholder={t("Search for an image")}
          />
        </div>
        <div className={styles.localFilePicker}>
          <label
            htmlFor="local-image-picker"
            className={styles.localPickerLabel}
          >
            {t("Or select a local file")}
          </label>
          <input
            id="local-image-picker"
            type="file"
            accept="image/*"
            onChange={handleLocalImageChange}
            style={{ display: "none" }}
          />
        </div>
        {searchResults.length > 0 && (
          <div className={styles.resultsGrid}>
            {searchResults.map((result) => (
              <figure key={result._id} style={{ margin: 0 }}>
                <img
                  src={`https://static.arasaac.org/pictograms/${result._id}/${result._id}_300.png`}
                  alt={result.keywords.join(", ")}
                  className={styles.resultImage}
                  onClick={() =>
                    handleImageChange(
                      `https://static.arasaac.org/pictograms/${result._id}/${result._id}_300.png`,
                    )
                  }
                />

                <figcaption style={{ fontSize: "9px" }}>
                  <a
                    href="https://arasaac.org/terms-of-use"
                    referrerPolicy="no-referrer"
                    rel="nofollow"
                  >
                    Arasaac, CC BY-NC-SA
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
        {searchResults.length === 0 && searchTerm.length !== 0 && (
          <p style={{ textAlign: "center", margin: 0 }}>
            {t("No result found")}
          </p>
        )}
      </div>
    </Section>
  );
};

export default ImagePicker;
