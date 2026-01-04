'use client'

import Link from 'next/link'
import ArticleForm from '@/components/ArticleForm'
import { useDocument } from '@/hooks/useDocument'
export const dynamic = 'force-dynamic'

export default function NewArticle() {
  useDocument({ title: 'Write New Article' })


  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/articles"
          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          ← Back to Articles
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Write New Article</h1>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ArticleForm 
          articleData={{ title: '', 
            body: '', 
            fields: [], 
            tags: [], 
            published: false, 
            sticky: false, 
            featured: false }} 
          />  
        </div>
      </div>
    </div>
  )
} 