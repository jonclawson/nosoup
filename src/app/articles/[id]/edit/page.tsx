'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'
import type { Article, Field, Author, FieldType, Tag } from '@/lib/types'
import ArticleForm from '@/components/ArticleForm'
import { useDocument } from '@/hooks/useDocument'


interface EditArticlePageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [article, setArticle] = useState<Article>({ title: '', body: '', fields: [], tags: [], published: false, sticky: false, featured: false })

  const [error, setError] = useState('')
  const [isLoadingArticle, setIsLoadingArticle] = useState(true)
  useDocument({ title: `Edit Article - ${resolvedParams.id}` })


  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('Article not found')
        }
        const articleData = await response.json()
        setArticle(articleData)
       
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoadingArticle(false)
      }
    }

    fetchArticle()
  }, [resolvedParams.id])

  if (isLoadingArticle) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="text-gray-500">Loading article...</div>
        </div>
      </div>
    )
  }

  if (error && !article) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="text-red-500">{error}</div>
          <Link href="/articles" className="text-blue-600 hover:text-blue-900 mt-4 inline-block">
            Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href={`/articles/${resolvedParams.id}`}
          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          ← Back
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Edit Article</h1>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ArticleForm 
          articleData={article}
          />
        </div>
      </div>
    </div>
  )
} 