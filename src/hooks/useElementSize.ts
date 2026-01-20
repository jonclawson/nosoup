import { useState, useCallback, useLayoutEffect } from 'react';

export function useElementSize() {
  const [size, setSize] = useState({ width: 0, height: 0, area: 0, size: 600 });
  const [node, setNode] = useState<HTMLElement | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    setNode(node);
  }, []);
  
  useLayoutEffect(() => {
    if (!node) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
            area: entry.contentRect.width * entry.contentRect.height,
            size: Math.min(Math.max(Math.floor(entry.contentRect.width * entry.contentRect.height / 900), 300), 600),

          });
        }
      }
    });

    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, [node]);

  return [ref, size] as const;
}