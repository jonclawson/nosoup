import { Article, Tag } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Tags({Article, style}: {Article?: Article, style?: string}) {
  const [ tags, setTags ] = useState<Tag[] | undefined>(Article?.tags || []);

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const data: Tag[] = await response.json();
          setTags(data);
        } else {
          console.error('Failed to fetch tags');
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    }

    if (!Article) {
      fetchTags();
    }
  }, [Article]);
  return (
     <div className="mt-4">
      {tags && tags.length > 0 && (
        <div className={`flex flex-wrap gap-2 ${style || ''}`}>
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
            >
              <Link href={`/articles/tagged/${tag.name}`}>
              {tag.name}
              </Link>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}