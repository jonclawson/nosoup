'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import SkeletonLine from './SkeletonLine'
import Setting from './Setting'
import { useStateContext } from '@/contexts/StateContext'
import styles from './Navigation.module.css'
import slugify from 'slugify'

export default function Navigation() {
  const { data: session, status, update } = useSession()
  const { getSetting } = useStateContext()
  let articlesLink = getSetting('navigation_articles_link')
  articlesLink = slugify(articlesLink || 'articles', { lower: true })

  if (status === 'loading') {
    return (
      <SkeletonLine />
    )
  }

    return (
      <div className={styles.nav}>
        <Link
          href={`/${articlesLink || 'articles'}`}
          className={styles['nav__link']}
        >
          <Setting type="text" setting="navigation_articles_link">Articles</Setting>
        </Link>
        {session && session.user?.role === 'admin' && (
          <Link
            href="/users"
            className={styles['nav__link']}
          >
            Users
          </Link>
        )}
      </div>
    )

} 