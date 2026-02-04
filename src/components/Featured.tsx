'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DeleteButton from './DeleteButton'
import Dompurify from './Dompurify'
import type { Article, Field, Author } from '@/lib/types'
import ArticleFields from './ArticleFields'
import { useEffect, useState } from 'react'
import ArticleTags from './ArticleTags'
import { useSession } from "next-auth/react"
import { handleDownload } from '@/lib/handle-downloads'
import styles from './Featured.module.css'
import truncate from 'truncate-html';
import { useElementSize } from '@/hooks/useElementSize'
import SkeletonBody from './SkeletonBody'

export default function Featured({published = true, sticky = true, tag}: { published?: boolean | null; featured?: boolean | null; sticky?: boolean | null; tag?: string }) {
  const router = useRouter()
  const [teaserRef, { size: truncSize }] = useElementSize();
  const [paused, setPaused] = useState(false);
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<{ page: number; size: number; total: number; totalPages: number }>({ page: 1, size: 1, total: 0, totalPages: 0 });
  const [pages, setPages] = useState<Map<number, Article>>(new Map());
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
        setPages(prevMap => (new Map(prevMap)).set(pagination.page, data[0]) as Map<number, Article>);
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (!paused) {
        fetchArticles(pagination.page + 1 > pagination.totalPages ? 1 : pagination.page + 1);
      }
    },  30 * 1000);

    return () => clearInterval(interval);
  }, [pagination, pagination.totalPages, paused]);


  return (
    <div className={styles['featured']}>
      <div className={styles['featured__list']}>
        {loading && articles.length === 0 ? (
          Array.from({ length: 1 }).map((_, i) => <SkeletonBody key={i} />)
        ) : (
          <div className={styles['featured__container']} onClick={() => setPaused(true)}>
          {articles.map((article) => (
            <article key={article.id} className={`${styles['featured__item']} ${article.published ? styles['featured__item--published'] : styles['featured__item--draft']}`}>
              {article.fields.length > 0 && (
              <div className={styles['featured__fields']}>
                <ArticleFields article={article} type="featured" />
              </div>
              )}
              <div className={styles['featured__content']} ref={teaserRef} >
                <div className={styles['featured__header']}>
                  <h2 className={styles['featured__title']}>
                    <Link
                      href={`/articles/${article.id}`}
                    >
                      {article.title}
                    </Link>
                  </h2>
                </div>
                
                <div className={styles['featured__teaser']} >
                  <div className={styles['featured__excerpt']} >
                    <div onClick={handleDownload}>
                      <Dompurify html={truncate(article.body, truncSize)} />
                    </div>
                  </div>
                </div>
                
                <div className={styles['featured__actions']}>
                  <ArticleTags article={article} />
                  <Link
                    href={`/articles/${article.id}`}
                    className={styles['featured__link']}
                  >
                    more →
                  </Link>
                  {session && session?.user?.role !== 'user' && (
                  <div className={styles['featured__admin']}>
                    <Link
                      href={`/articles/${article.id}/edit`}
                      className={styles['featured__admin__edit']}
                    >
                      Edit
                    </Link>
                    <DeleteButton 
                      userId={article.id || ''} 
                      onDelete={() => setArticles(articles.filter(a => a.id !== article.id))}
                      className={styles['featured__admin__delete']}
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
              <div className={styles['featured__pagination']}>
                {pages.size > 0 && [...pages].map(([p, a]) => (
                  <button
                    key={p}
                    onClick={() => fetchArticles(p)}
                    className={styles['featured__page_number']}
                    title={a?.title || ''}
                  >
                    {!!a?.fields && !!a?.fields.find(f => f.type === 'image') &&
                      <img 
                        src={a.fields.find((f: Field) => f.type === 'image')?.value || ''} 
                        alt={a.title} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    }
                  </button>
                  ))
                }
                <button
                  onClick={() => fetchArticles(pagination.page + 1 > pagination.totalPages ? 1 : pagination.page + 1)}
                  className={styles['featured__next']}
                >
                  Next &rarr;
                </button>
              </div>
            )}

            {articles.length === 0 && !loading && (
              <div className={styles['featured__empty']}>
                <div className={styles['featured__empty__title']}>No articles yet.</div>
                <div className={styles['featured__empty__desc']}>Be the first to write an article!</div>
              </div>
            )}
            </div>
        )}
      </div>

    </div>
  )
} 