'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DeleteButton from './DeleteButton'

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

interface ArticleListProps {
  articles: Article[]
}

export default function ArticleList({ articles }: ArticleListProps) {
  const router = useRouter()
  
  return (
    <div className="mt-8">
      <div className="space-y-6">
        {articles.map((article) => (
          <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {article.title}
                </h2>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>By {article.author.name}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 line-clamp-6 leading-relaxed">
                  {article.body}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Link
                  href={`/articles/${article.id}`}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  Read more →
                </Link>
                <div className="flex space-x-2">
                  <Link
                    href={`/articles/${article.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    Edit
                  </Link>
                  <DeleteButton 
                    userId={article.id} 
                    onDelete={() => router.push('/articles')}
                    className="text-red-600 hover:text-red-900 text-sm"
                    resourceType="article"
                  >
                    Delete
                  </DeleteButton>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      {articles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No articles yet.</div>
          <div className="text-gray-400 text-sm mt-2">Be the first to write an article!</div>
        </div>
      )}
    </div>
  )
} 