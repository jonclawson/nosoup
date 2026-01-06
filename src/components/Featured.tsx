'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DeleteButton from './DeleteButton'
import Dompurify from './Dompurify'
import type { Article, Field, Author } from '@/lib/types'
import ArticleFields from './ArticleFields'
import { useEffect, useState } from 'react'
import SkeletonArticle from './SkeletonArticle'
import ArticleTags from './ArticleTags'
import { useSession } from "next-auth/react"
import { handleDownload } from '@/lib/handle-downloads'

export default function Featured({published = true, sticky = true, tag}: { published?: boolean | null; featured?: boolean | null; sticky?: boolean | null; tag?: string }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<{ page: number; size: number; total: number; totalPages: number }>({ page: 1, size: 1, total: 0, totalPages: 0 });
  const fetchArticles = async (page: number = 1) => {
    try {
      const urlParams = new URLSearchParams();
      urlParams.append('page', page.toString());
      urlParams.append('size', pagination.size.toString());
      if (published !== null) {
        urlParams.append('published', published.toString());
      }
      if (sticky !== null) {
        urlParams.append('sticky', sticky.toString());
      }
      if (tag) {
        urlParams.append('tag', tag);
      }
      urlParams.append('featured', 'true');
      urlParams.append('tab', 'false');
      const response = await fetch(`/api/articles?${urlParams.toString()}`);
      if (response.ok) {
        const { data, pagination } = await response.json();
        setLoading(false);
        setArticles([...data]);
        setPagination(pagination);
      } else {
        console.error('Failed to fetch articles:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };
  useEffect(() => {
    fetchArticles();
  }, []);
  
  return (
    <div className="mt-8 featured-articles">
      <div className="space-y-6">
        {loading && articles.length === 0 ? (
          Array.from({ length: 1 }).map((_, i) => <SkeletonArticle key={i} />)
        ) : (
          <div className="flex  rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
          {articles.map((article) => (
            <article key={article.id} className={`${article.published ? 'bg-white' : 'bg-pink-100'} flex-1`}>
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {article.title}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>By {article?.author?.name}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(article?.createdAt || '').toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="mb-4 max-h-96 overflow-y-hidden">
                  <div className="text-gray-700 line-clamp-6 leading-relaxed">
                    <ArticleFields article={article} />
                    <div onClick={handleDownload}>
                      <Dompurify html={article.body} />
                    </div>
                    <ArticleTags article={article} />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Link
                    href={`/articles/${article.id}`}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Read more →
                  </Link>
                  {session && session?.user?.role !== 'user' && (
                  <div className="flex space-x-2">
                    <Link
                      href={`/articles/${article.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 text-sm"
                    >
                      Edit
                    </Link>
                    <DeleteButton 
                      userId={article.id || ''} 
                      onDelete={() => setArticles(articles.filter(a => a.id !== article.id))}
                      className="text-red-600 hover:text-red-900 text-sm"
                      resourceType="article"
                    >
                      Delete
                    </DeleteButton>
                  </div>
                  )}
                </div>
              </div>
            </article>
          ))}
            { !loading && pagination.page <= pagination.totalPages && (
              
                <button
                  onClick={() => fetchArticles(pagination.page + 1 > pagination.totalPages ? 1 : pagination.page + 1)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                >
                  Next
                </button>
            )}
              </div>
        )}
      </div>

      {articles.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No articles yet.</div>
          <div className="text-gray-400 text-sm mt-2">Be the first to write an article!</div>
        </div>
      )}
    </div>
  )
} 