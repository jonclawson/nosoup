'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './Search.module.css'
import { useDebounce } from '@/lib/debounce'

interface Article {
  id: string
  title: string
  slug: string
  published: boolean
}

export default function Search() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)

  const debouncedQuery = useDebounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/articles/search/${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.articles || [])
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, 300)

  useEffect(() => {
    debouncedQuery(query)
  }, [query, debouncedQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleIconClick = () => {
    setIsExpanded(true)
  }

  const handleInputBlur = () => {
    // Optionally collapse on blur if no query
    if (!query.trim()) {
      setIsExpanded(false)
    }
  }

  return (
    <div className={styles.search}>
      {!isExpanded ? (
        <button
          onClick={handleIconClick}
          className={styles['search__icon-btn']}
          aria-label="Search"
        >
          <svg
            className={styles['search__icon']}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      ) : (
        <div className={styles['search__input-wrap']}>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="Search articles..."
            className={styles['search__input']}
            autoFocus
          />
          <svg
            className={styles['search__input-icon']}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {loading && (
            <div className={styles['search__loading']}>
              <div className={styles['search__spinner']}></div>
            </div>
          )}
        </div>
      )}

      {isExpanded && (results.length > 0 || loading) && (
        <div className={styles['search__results']}>
          {loading ? (
            <div className={styles['search__searching']}>Searching...</div>
          ) : results.length > 0 ? (
            results.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className={styles['search__result']}
                onClick={() => {
                  setIsExpanded(false)
                  setQuery('')
                  setResults([])
                }}
              >
                <div className={styles['search__result__title']}>{article.title}</div>
                <div className={styles['search__result__meta']}>
                  {article.published ? 'Published' : 'Draft'}
                </div>
              </Link>
            ))
          ) : query.trim() && !loading ? (
            <div className={styles['search__noresults']}>No results found</div>
          ) : null}
        </div>
      )}
    </div>
  )
}