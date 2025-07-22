import { first } from "../helpers/lists";

export default function useStyle<T, K extends keyof T>(
  selected: T[],
  style: K,
  fallback: T[K],
) {
  if (selected.length === 0) return fallback;

  const firstElement = first(selected);

  return selected.every(({ [style]: s }) => s === firstElement[style])
    ? firstElement[style]
    : undefined;
}
