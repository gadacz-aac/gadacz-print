import { useEffect } from "react";
import Select from "./Select";

const localFonts = ["Arial", "Times New Roman"];

const googleFonts = ["Roboto", "Open Sans", "Lato", "Montserrat", "Oswald"];

const allFonts = [...localFonts, ...googleFonts];

const loadFont = (fontFamily: string) => {
  if (!fontFamily) return;
  if (!googleFonts.includes(fontFamily)) return;
  const font = fontFamily.replace(/ /g, "+");
  const linkId = `font-link-${font}`;

  if (document.getElementById(linkId)) {
    return;
  }

  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
  document.head.appendChild(link);
};

const FontPicker = ({
  onStyleChange,
  currentFont,
}: {
  onStyleChange: (property: string, value: unknown) => void;
  currentFont: string | undefined;
}) => {
  useEffect(() => {
    if (currentFont) {
      loadFont(currentFont);
    }
  }, [currentFont]);

  const handleFontChange = (font: string) => {
    loadFont(font);

    onStyleChange("fontFamily", font);
  };

  return (
    <Select
      options={allFonts}
      value={currentFont ?? ""}
      onChange={handleFontChange}
    />
  );
};

export default FontPicker;
