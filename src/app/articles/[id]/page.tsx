'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import Dompurify from '@/components/Dompurify'
import type { Article, Field, Author } from '@/lib/types'
import ArticleFields from '@/components/ArticleFields'
import SkeletonArticle from '@/components/SkeletonArticle'
import "@blocknote/mantine/style.css"
import "@blocknote/core/fonts/inter.css";
import ArticleTags from '@/components/ArticleTags'
import { useSession } from 'next-auth/react'
import { handleDownload } from '@/lib/handle-downloads'
import { useDocument } from '@/hooks/useDocument'
import styles from './page.module.css'
interface ArticlePageProps {
  params: Promise<{
    id: string
  }>
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { data: session, status } = useSession()
  const { setTitle } = useDocument()

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${resolvedParams.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Article not found')
          } else {
            setError('Failed to fetch article')
          }
          return
        }
        const articleData = await response.json()
        if (articleData && articleData.slug) {
          router.replace(`/${articleData.slug}`)
        }
        setTitle(articleData.title)
        setArticle(articleData)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch article')
        setLoading(false)
      }
    }

    fetchArticle()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className={styles['article-page']}>
        <div className="section-outer">
          <div className="section">
            <div className="section-inner">
            <div className={styles['article-page__back']}>
              <Link
                href="/articles"
                className={styles['article-page__back__link']}
              >
                ← Back
              </Link>
            </div>
            <SkeletonArticle />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles['article-page']}>
        <div className={styles['article-page__error']}>
          <div className={styles['article-page__error__text']}>{error || 'Article not found'}</div>
          <Link href="/articles" className={styles['article-page__error__back']}>
            Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles['article-page']}>
      <div className="section-outer">
        <div className="section">
          <div className="section-inner">
            <div className={styles['article-page__back']}>
              <Link
                href="/articles"
                className={styles['article-page__back__link']}
              >
                ← Back
            </Link>
          </div>

          <article className={`${styles['article-page__container']} ${article?.published ? styles['article-page__container--published'] : styles['article-page__container--draft']}`}>
            <div className={styles['article-page__header']}>
              <h1 className={styles['article-page__title']}>
                {article?.title}
              </h1>
              <div className={styles['article-page__meta']}>
                <span>By {article?.author?.name}</span>
                <span className={styles['article-page__meta__dot']}>•</span>
                <span>{new Date(article?.createdAt || '').toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className={styles['article-page__divider']}>
              <div className={styles['article-page__body']}>
                <div className={styles['article-page__prose']}>
                  <div className={styles['article-page__text']}>
                    <ArticleFields article={article} />
                  </div>
                  <div className={styles['article-page__text--download']} onClick={handleDownload}>
                    <Dompurify html={article?.body || ''} />
                  </div>
                  <ArticleTags article={article} />
                </div>
              </div>
            </div>
          </article>
          
          <div className={styles['article-page__actions']}>
            {session && session?.user?.role !== 'user' && (
            <>
              <Link
                href={`/articles/${article?.id}/edit`}
                className={`${styles['article-page__btn']} ${styles['article-page__btn--edit']}`}
              >
                Edit Article
            </Link>
            <DeleteButton 
              userId={article?.id || ''} 
              onDelete={() => router.push('/articles')}
              className={`${styles['article-page__btn']} ${styles['article-page__btn--delete']}`}
              resourceType="article"
            >
              Delete Article
            </DeleteButton>
            </>
            )}
          </div>
          </div>
        </div>
      </div>

    </div>
  )
} 