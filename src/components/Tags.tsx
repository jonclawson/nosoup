import { Article, Tag } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from './Tags.module.css'

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
     <div className={styles.tags}>
      {tags && tags.length > 0 && (
        <div className={`${styles['tags__list']} ${style || ''}`}>
          {tags.map((tag) => (
            <span
              key={tag.id}
              className={styles['tags__tag']}
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