import { useEffect, useState } from "react";
import { useStateContext } from "@/contexts/StateContext";

export function useDocument({title: initialTitle}: {title?: string} = {}) {
  const [title, setTitle] = useState<string | null>(initialTitle || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { siteName } = useStateContext();
  useEffect(() => {
    async function fetchDocument() {
      try {
        
        document.title = (title ? `${title} | ` : '') + (siteName ? siteName : '');
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, [siteName, title]);

  return { setTitle, loading, error };
}