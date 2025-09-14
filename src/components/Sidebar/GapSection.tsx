import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store/store";
import useSelected from "../../hooks/useSelectedSymbols";
import Input from "./Input";
import { determineGridGaps } from "../../helpers/gap";

export default function GapSection() {
  const handleGapChange = useAppStore.use.handleGapChange();
  const selected = useSelected();

  const { t } = useTranslation();

  const gap = determineGridGaps(selected);

  return (
    <>
      <Input
        label={t("Gap.horizontal")}
        defaultValue={gap.rowGap ?? 0}
        onBlur={(e) => handleGapChange({ x: Number(e) })}
      />
      <Input
        label={t("Gap.vertical")}
        defaultValue={gap.columnGap ?? 0}
        onBlur={(e) => handleGapChange({ y: Number(e) })}
      />
    </>
  );
}

