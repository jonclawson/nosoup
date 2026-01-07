'use client'

import Link from 'next/link'
import ArticleForm from '@/components/ArticleForm'
import { useDocument } from '@/hooks/useDocument'
import styles from './NewArticle.module.css'
export const dynamic = 'force-dynamic'

export default function NewArticle() {
  useDocument({ title: 'Write New Article' })


  return (
    <div className={styles['new-article']}>
      <div className={styles['new-article__header']}>
        <Link
          href="/articles"
          className={styles['new-article__back-link']}
        >
          ← Back
        </Link>
        <h1 className={styles['new-article__title']}>Write New Article</h1>
      </div>

      <div className={styles['new-article__card']}>
        <div className={styles['new-article__card-body']}>
          <ArticleForm 
          articleData={{ title: '', 
            body: '', 
            fields: [], 
            tags: [], 
            published: false, 
            sticky: false, 
            featured: false }} 
          />  
        </div>
      </div>
    </div>
  )
} 