'use client'
import Link from 'next/link'
import ArticleList from '@/components/ArticleList'
import { useSession } from "next-auth/react"
import Setting from '@/components/Setting'
import { useDocument } from '@/hooks/useDocument'
import { useStateContext } from '@/contexts/StateContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import styles from './page.module.css'
import slugify from 'slugify'

export default function ArticlesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { getSetting } = useStateContext()
  useEffect (() => {
    let articlesAlias = getSetting('navigation_articles_link')
    if (articlesAlias && articlesAlias !== 'articles') {
      articlesAlias = slugify(articlesAlias, { lower: true })
      router.push(`/${articlesAlias}`)
    }
  }, [])

  const pageTitle = getSetting('navigation_articles_link') || 'Articles'
  useDocument({ title: pageTitle })

  return (
    <div className={styles.articles}>
      <Setting title="Show Articles Page Header" type="show" setting="show_articles_page_header">
        <div className={styles['articles__header']}>
          <div className={styles['articles__header__content']}>
          <Setting setting="articles_page_header">
            <h1 className={styles['articles__title']}>Articles</h1>
            <p className={styles['articles__desc']}>
              A collection of articles from our community.
            </p>
          </Setting>
          </div>
          {session && session?.user?.role !== 'user' && (
            <div className={styles['articles__actions']}>
            <Link
              href="/articles/new"
              className={styles['articles__actions__add']}
              >
              +
            </Link>
          </div>
          )}
        </div>
      </Setting>
      <ArticleList  />
    </div>
  )
} 