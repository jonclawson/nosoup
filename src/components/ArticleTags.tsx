'use client';
import { Article } from "@/lib/types";
import Tags from "./Tags";

export default function ArticleTags({ article }: { article: Article | null }) {
  if (!article?.tags || article.tags.length === 0) {
    return null;
  }

  return (
    <Tags Article={article} />
  );
}