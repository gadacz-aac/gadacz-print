import { useState } from "react";
import type { onStyleChangeFn } from "./Sidebar";
import styles from "./ImagePicker.module.css";

type ArasaacPictogram = {
  _id: number;
  keywords: string[];
};

const ImagePicker = ({ onStyleChange }: { onStyleChange: onStyleChangeFn }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ArasaacPictogram[]>([]);

  const handleSearch = async () => {
    if (!searchTerm) return;
    try {
      const response = await fetch(
        `https://api.arasaac.org/v1/pictograms/en/search/${searchTerm}`,
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleLocalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onStyleChange("image", event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.imagePicker}>
      <div className={styles.sectionHeader}>
        <h4>Image</h4>
      </div>
      <div className={styles.searchSection}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for an image"
          className={styles.searchInput}
        />
        <button onClick={handleSearch} className={styles.searchButton}>
          Search
        </button>
      </div>
      <div className={styles.localFilePicker}>
        <label htmlFor="local-image-picker" className={styles.localPickerLabel}>
          Or select a local file
        </label>
        <input
          id="local-image-picker"
          type="file"
          accept="image/*"
          onChange={handleLocalImageChange}
          style={{ display: "none" }}
        />
      </div>
      <div className={styles.resultsGrid}>
        {searchResults.map((result) => (
          <img
            key={result._id}
            src={`https://static.arasaac.org/pictograms/${result._id}/${result._id}_300.png`}
            alt={result.keywords.join(", ")}
            className={styles.resultImage}
            onClick={() =>
              onStyleChange(
                "image",
                `https://static.arasaac.org/pictograms/${result._id}/${result._id}_300.png`,
              )
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ImagePicker;
