import { useEffect, useRef } from "react";

export default function useScrollInView(watch: any[] = [], callback?: (entry: IntersectionObserverEntry, observer: IntersectionObserver) => void) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            if (callback) {
              callback(entry, observer);
            }
            // observer.unobserve(entry.target); // Trigger only once
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (ref.current) {
      const items = ref.current.querySelectorAll('.scroll-in-view'); // Use 'scroll-in-view' class to identify items
      items.forEach((item: any) => observer.observe(item));
    }

    return () => observer.disconnect();
  }, [watch]);
  return ref; // use on parent container
}