import { useCallback, useRef } from "react";

export const useDebounce = (callback: any, delay: number | undefined) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Add this line
  callbackRef.current = callback;

  return useCallback(
    (...args: any) => {
      const fn = () => callbackRef.current(...args);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(fn, delay);
    },
    [delay]
  );
};