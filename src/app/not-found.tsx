import Link from 'next/link'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <div className={styles['not-found__root']}> 
      <div className={styles['not-found__container']}>
        <div className={styles['not-found__card']}>
          <div className={styles['not-found__content']}>
            <h1 className={styles['not-found__title']}>404</h1>
            <h2 className={styles['not-found__subtitle']}>Page not found</h2>
            <p className={styles['not-found__desc']}> 
              Sorry, we couldn't find the page you're looking for.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className={styles['not-found__home-btn']}
              >
                Go back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 