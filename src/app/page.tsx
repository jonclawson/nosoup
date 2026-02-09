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
      <div className="section-outer">
        <div className="section">
          <Setting title="Show Featured Title" type="show" setting="show_featured_articles_header">
          <div className="section-inner">
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
          </div>
          </Setting>
        </div>
      </div>
      <div className="section-outer">
        <div className="section">
          <div className="section-inner">
          <Featured />
          </div>
        </div>
      </div>
      <div className="section-outer">
        <div className="section">
          <div className="section-inner">
          <Setting title="Show Tags" type="show" setting="show_tags" loading="footer">
            <Tags style={styles['page__tags']} />
          </Setting>
          </div>
        </div>
      </div>
    </div>
  )
} 