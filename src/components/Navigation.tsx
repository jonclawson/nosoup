'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import SkeletonLine from './SkeletonLine'
import Setting from './Setting'
import { useStateContext } from '@/contexts/StateContext'
import styles from './Navigation.module.css'

export default function Navigation() {
  const { data: session, status, update } = useSession()
  const { getSetting } = useStateContext()

  if (status === 'loading') {
    return (
      <SkeletonLine />
    )
  }

    return (
      <div className={styles.nav}>
        <Link
          href={`/${getSetting('navigation_articles_link') || 'articles'}`}
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