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

export default function ArticleList() {
  const router = useRouter()
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<{ page: number; size: number; total: number; totalPages: number }>({ page: 1, size: 10, total: 0, totalPages: 0 });
  const fetchArticles = async (page: number = 1) => {
    try {
      const response = await fetch(`/api/articles?page=${page}&size=${pagination.size}&published=true&featured=true&sticky=true`);
      if (response.ok) {
        const { data, pagination } = await response.json();
        setLoading(false);
        setArticles([...articles, ...data]);
        setPagination(pagination);
        console.log('Fetched articles:', data);
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
    <div className="mt-8">
      <div className="space-y-6">
        {loading && articles.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonArticle key={i} />)
        ) : (
          articles.map((article) => (
            <article key={article.id} className={`${article.published ? 'bg-white' : 'bg-pink-100'} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200`}>
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
                
                <div className="mb-4">
                  <div className="text-gray-700 line-clamp-6 leading-relaxed">
                    <ArticleFields article={article} />
                    <Dompurify html={article.body} />
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
                  <div className="flex space-x-2">
                    <Link
                      href={`/articles/${article.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 text-sm"
                    >
                      Edit
                    </Link>
                    <DeleteButton 
                      userId={article.id || ''} 
                      onDelete={() => router.push('/articles')}
                      className="text-red-600 hover:text-red-900 text-sm"
                      resourceType="article"
                    >
                      Delete
                    </DeleteButton>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {articles.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No articles yet.</div>
          <div className="text-gray-400 text-sm mt-2">Be the first to write an article!</div>
        </div>
      ) : !loading && pagination.page < pagination.totalPages && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchArticles(pagination.page + 1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  )
} 