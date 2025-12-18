import { Article } from "@/lib/types";

export default function ArticleTags({ article }: { article: Article }) {
  if (!article.tags || article.tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}