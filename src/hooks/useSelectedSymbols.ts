import { useAppStore } from "../store/store";

export default function useSelected() {
  const elements = useAppStore.use.elements();
  const selectedIds = useAppStore.use.selectedIds();

  return elements.filter(({ id }) => selectedIds.includes(id));
}
