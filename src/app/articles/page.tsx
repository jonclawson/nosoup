import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ArticleList from '@/components/ArticleList'

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      fields: {
        select: {
          id: true,
          type: true,
          value: true
        }
      },
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Serialize dates to prevent hydration issues
  const serializedArticles = articles.map(article => ({
    ...article,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString()
  }))

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Articles</h1>
          <p className="mt-2 text-sm text-gray-700">
            A collection of articles from our community.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/articles/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Write Article
          </Link>
        </div>
      </div>
      <ArticleList articles={serializedArticles} />
    </div>
  )
} 