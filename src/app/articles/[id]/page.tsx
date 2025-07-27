'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'
import { use } from 'react'
import { useRouter } from 'next/navigation'

interface Author {
  id: string
  name: string
  email: string
}

interface Article {
  id: string
  title: string
  body: string
  authorId: string
  author: Author
  createdAt: string
  updatedAt: string
}

interface ArticlePageProps {
  params: Promise<{
    id: string
  }>
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${resolvedParams.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Article not found')
          } else {
            setError('Failed to fetch article')
          }
          return
        }
        const articleData = await response.json()
        setArticle(articleData)
      } catch (err) {
        setError('Failed to fetch article')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="text-gray-500">Loading article...</div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="text-red-500">{error || 'Article not found'}</div>
          <Link href="/articles" className="text-blue-600 hover:text-blue-900 mt-4 inline-block">
            Back to Articles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/articles"
          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          ← Back to Articles
        </Link>
      </div>

      <article className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <span>By {article.author.name}</span>
            <span className="mx-2">•</span>
            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {article.body}
              </div>
            </div>
          </div>
        </div>
      </article>

      <div className="mt-6 flex space-x-3">
        <Link
          href={`/articles/${article.id}/edit`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit Article
        </Link>
        <DeleteButton 
          userId={article.id} 
          onDelete={() => router.push('/articles')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          resourceType="article"
        >
          Delete Article
        </DeleteButton>
      </div>
    </div>
  )
} 