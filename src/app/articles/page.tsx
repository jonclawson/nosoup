'use client'
import Link from 'next/link'
import ArticleList from '@/components/ArticleList'
import { useSession } from "next-auth/react"
import Setting from '@/components/Setting'
import { useDocument } from '@/hooks/useDocument'
import { useStateContext } from '@/contexts/StateContext'

export default function ArticlesPage() {
  const { data: session, status } = useSession()
  const { getSetting } = useStateContext()
  const pageTitle = getSetting('navigation_articles_link') || 'Articles'
  useDocument({ title: pageTitle })

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
        <Setting setting="articles_page_header">
          <h1 className="text-2xl font-semibold text-gray-900">Articles</h1>
          <p className="mt-2 text-sm text-gray-700">
            A collection of articles from our community.
          </p>
        </Setting>
        </div>
        {session && session?.user?.role !== 'user' && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/articles/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
            +
          </Link>
        </div>
        )}
      </div>
      <ArticleList  />
    </div>
  )
} 