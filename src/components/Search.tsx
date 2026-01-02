'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
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
    <div className="relative">
      {!isExpanded ? (
        <button
          onClick={handleIconClick}
          className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
          aria-label="Search"
        >
          <svg
            className="w-5 h-5"
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
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="Search articles..."
            className="w-64 px-4 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
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
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      )}

      {isExpanded && (results.length > 0 || loading) && (
        <div className="absolute top-full mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            results.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => {
                  setIsExpanded(false)
                  setQuery('')
                  setResults([])
                }}
              >
                <div className="font-medium">{article.title}</div>
                <div className="text-xs text-gray-500">
                  {article.published ? 'Published' : 'Draft'}
                </div>
              </Link>
            ))
          ) : query.trim() && !loading ? (
            <div className="px-4 py-2 text-sm text-gray-500">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  )
}