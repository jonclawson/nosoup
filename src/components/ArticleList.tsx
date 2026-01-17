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
import styles from './ArticleList.module.css' 

export default function ArticleList({published = true, featured = null, sticky = true, tag}: { published?: boolean | null; featured?: boolean | null; sticky?: boolean | null; tag?: string }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<{ page: number; size: number; total: number; totalPages: number }>({ page: 1, size: 10, total: 0, totalPages: 0 });
  const fetchArticles = async (page: number = 1) => {
    try {
      const urlParams = new URLSearchParams();
      urlParams.append('page', page.toString());
      urlParams.append('size', pagination.size.toString());
      if (published !== null) {
        urlParams.append('published', published.toString());
      }
      if (featured !== null) {
        urlParams.append('featured', featured.toString());
      }
      if (sticky !== null) {
        urlParams.append('sticky', sticky.toString());
      }
      if (tag) {
        urlParams.append('tag', tag);
      }
      urlParams.append('tab', 'false');
      const response = await fetch(`/api/articles?${urlParams.toString()}`);
      if (response.ok) {
        const { data, pagination } = await response.json();
        setLoading(false);
        setArticles([...articles, ...data]);
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
    <div className={styles['article-list']}> 
      <div className={styles['article-list__list']}>
        {loading && articles.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
          <div className="section-outer" key={i}>
            <div className="section">
              <SkeletonArticle key={i} />
            </div>
          </div>  
        ))
        ) : (
          articles.map((article) => (
            <div className="section-outer" key={article.id}>
              <div className="section">
                <div className="section-inner">
                <article key={article.id} 
                className={`${styles['article-list__item']} ${article.published ? styles['article-list__item--published'] : styles['article-list__item--draft']}`}>
                  <div className={styles['article-list__content']}> 
                    <div className={styles['article-list__header']}>
                      <h2 className={styles['article-list__title']}>
                        <Link
                          href={`/articles/${article.id}`}
                        >
                          {article.title}
                        </Link>
                      </h2>
                      <div className={styles['article-list__meta']}>
                        <span>By {article?.author?.name}</span>
                        <span className={styles['article-list__meta__dot']}>•</span>
                        <span>{new Date(article?.createdAt || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className={styles['article-list__summary']}>
                      <div className={styles['article-list__excerpt']}>
                        <ArticleFields article={article} />
                        <div onClick={handleDownload}>
                          <Dompurify html={article.body} />
                        </div>
                        <ArticleTags article={article} />
                      </div>
                    </div>
                    
                    <div className={styles['article-list__actions']}>
                      <Link
                        href={`/articles/${article.id}`}
                        className={styles['article-list__link']}
                      >
                        Read more →
                      </Link>
                      {session && session?.user?.role !== 'user' && (
                      <div className={styles['article-list__admin']}>
                        <Link
                          href={`/articles/${article.id}/edit`}
                          className={styles['article-list__admin__edit']}
                        >
                          Edit
                        </Link>
                        <DeleteButton 
                          userId={article.id || ''} 
                          onDelete={() => setArticles(articles.filter(a => a.id !== article.id))}
                          className={styles['article-list__admin__delete']}
                          resourceType="article"
                        >
                          Delete
                        </DeleteButton>
                      </div>
                      )}
                    </div> 
                  </div>
                </article>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {articles.length === 0 && !loading ? (
        <div className={styles['article-list__empty']}>
          <div className={styles['article-list__empty__title']}>No articles yet.</div>
          <div className={styles['article-list__empty__desc']}>Be the first to write an article!</div>
        </div>
      ) : !loading && pagination.page < pagination.totalPages && (
        <div className={styles['article-list__loadmore']}>
          <button
            onClick={() => fetchArticles(pagination.page + 1)}
            className={styles['article-list__loadmore__button']}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  )
} 