'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'
import type { Article, Field, Author, FieldType, Tag } from '@/lib/types'
import ArticleForm from '@/components/ArticleForm'
import { useDocument } from '@/hooks/useDocument'
import styles from './page.module.css'


interface EditArticlePageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [article, setArticle] = useState<Article>({ title: '', body: '', fields: [], tags: [], published: false, sticky: false, featured: false })

  const [error, setError] = useState('')
  const [isLoadingArticle, setIsLoadingArticle] = useState(true)
  useDocument({ title: `Edit Article - ${resolvedParams.id}` })


  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('Article not found')
        }
        const articleData = await response.json()
        setArticle(articleData)
       
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoadingArticle(false)
      }
    }

    fetchArticle()
  }, [resolvedParams.id])

  if (isLoadingArticle) {
    return (
      <div className={styles['edit-article-page__loading']}>
        <div className={styles['edit-article-page__loading__inner']}>
          <div className={styles['edit-article-page__loading__text']}>Loading article...</div>
        </div>
      </div>
    )
  }

  if (error && !article) {
    return (
      <div className={styles['edit-article-page__error']}>
        <div className={styles['edit-article-page__error__inner']}>
          <div className={styles['edit-article-page__error__text']}>{error}</div>
          <Link href="/articles" className={styles['edit-article-page__back-link']}>
            Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles['edit-article-page__wrap']}>
      <div className="mb-8">
        <Link
          href={`/articles/${resolvedParams.id}`}
          className={styles['edit-article-page__back-link']}
        >
          ← Back
        </Link>
        <h1 className={styles['edit-article-page__heading']}>Edit Article</h1>
      </div>

      <div className={styles['edit-article-page__card']}>
        <div className={styles['edit-article-page__card-body']}>
          <ArticleForm 
          articleData={article}
          />
        </div>
      </div>
    </div>
  )
} 