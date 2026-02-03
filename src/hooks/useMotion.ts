import { useEffect, useRef } from "react";

export default function useMotion(watch: any[] = []) {
  const gridRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const delay = index * 0.1; // Match the original delay
            (entry.target as HTMLElement).style.animationDelay = `${delay}s`;
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target); // Trigger only once
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (gridRef.current) {
      const items = gridRef.current.querySelectorAll('.motion'); // Use 'motion' class to identify items
      items.forEach((item: any) => observer.observe(item));
    }

    return () => observer.disconnect();
  }, [watch]);
  return gridRef; // use on parent container
}