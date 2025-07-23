import { useEffect, type RefObject } from "react";

export default function useOutsideClick<T extends HTMLElement | null>(
  ref: RefObject<T>,
  callback: () => void,
) {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        console.log(ref.current, event.target);
        // callback();
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [ref, callback]);
}
