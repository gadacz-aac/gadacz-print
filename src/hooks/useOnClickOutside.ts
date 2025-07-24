import { type RefObject, useEffect } from "react";

export default function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handleOnClickOutside: (event: MouseEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref?.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handleOnClickOutside(event);
    };
    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handleOnClickOutside]);
}
