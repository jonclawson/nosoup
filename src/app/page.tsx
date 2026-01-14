'use client'
import Link from 'next/link'
import Setting from '@/components/Setting'
import { useDocument } from '@/hooks/useDocument'
import Featured from '@/components/Featured'
import Tags from '@/components/Tags'
import styles from './page.module.css'

export default function HomePage() {
  useDocument({ title: '' })
  
  return (
    <div className={styles.page}>
        <Setting title="Show Featured Title" type="show" setting="show_featured_articles_header">
          <Setting setting="featured_articles_header">
            <div className={styles['page__featured']}>
                <div className={styles['page__featured__content']}>
                  <h1 className={styles['page__featured__title']}>Featured Articles</h1>
                  <p className={styles['page__featured__desc']}>
                    A collection of <i>featured</i> articles from our community.
                  </p>
                </div>
                <div className={styles['page__featured__actions']}>
                  <Link
                    href="/articles/"
                    className={styles['page__featured__link']}
                  >
                    More &rarr;
                  </Link>
                </div>
            </div>
          </Setting>
        </Setting>
      <Featured />
      <Tags style={styles['page__tags']} />
    </div>
  )
} 