import { useTranslation } from "react-i18next";
import Section from "./Section";
import sidebarStyle from "./Sidebar.module.css";
import {
  MdAlignHorizontalCenter,
  MdAlignHorizontalLeft,
  MdAlignHorizontalRight,
  MdAlignVerticalBottom,
  MdAlignVerticalCenter,
  MdAlignVerticalTop,
} from "react-icons/md";
import { useAppStore } from "../../store/store";

export default function Aligment() {
  const { t } = useTranslation();
  const align = useAppStore.use.align();

  return (
    <Section title={t("Alignment")} grid>
      <div className={sidebarStyle.colorGrid}>
        <button
          onClick={() => align("x", "start")}
          className={sidebarStyle.colorSwatch}
        >
          <MdAlignHorizontalLeft />
        </button>
        <button
          onClick={() => align("x", "center")}
          className={sidebarStyle.colorSwatch}
        >
          <MdAlignHorizontalCenter />
        </button>
        <button
          onClick={() => align("x", "end")}
          className={sidebarStyle.colorSwatch}
        >
          <MdAlignHorizontalRight />
        </button>
      </div>

      <div className={sidebarStyle.colorGrid}>
        <button
          onClick={() => align("y", "start")}
          className={sidebarStyle.colorSwatch}
        >
          <MdAlignVerticalTop />
        </button>
        <button
          onClick={() => align("y", "center")}
          className={sidebarStyle.colorSwatch}
        >
          <MdAlignVerticalCenter />
        </button>
        <button
          onClick={() => align("y", "end")}
          className={sidebarStyle.colorSwatch}
        >
          <MdAlignVerticalBottom />
        </button>
      </div>
    </Section>
  );
}
