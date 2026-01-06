'use client'
import Link from 'next/link'
import ArticleList from '@/components/ArticleList'
import { useSession } from "next-auth/react"
import Setting from '@/components/Setting'
import { useDocument } from '@/hooks/useDocument'
import Featured from '@/components/Featured'

export default function HomePage() {
  const { data: session, status } = useSession()
  useDocument({ title: '' })
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
        <Setting setting="featured_articles_header">
          <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold text-gray-900">Featured Articles</h1>
                <p className="mt-2 text-sm text-gray-700">
                  A collection of <i>featured</i> articles from our community.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <Link
                  href="/articles/"
                  className="inline-flex items-center justify-center  px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  More &rarr;
                </Link>
              </div>
          </div>
        </Setting>
      <Featured />
    </div>
  )
} 