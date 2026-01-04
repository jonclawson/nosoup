'use client'
import Link from 'next/link'
import ArticleList from '@/components/ArticleList'
import { useSession } from "next-auth/react"
import Setting from '@/components/Setting'
import { use } from 'react'
import { useDocument } from '@/hooks/useDocument'

export default function ArticlesPage({ params }: {
  params: Promise<{
    tag: string
  }>
}) {
  const { data: session, status } = useSession()
  const { tag } = use(params)
  useDocument({ title: `Articles tagged with ${tag}` })

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
        <Setting setting="articles_tagged_page_header">
          <h1 className="text-2xl font-semibold text-gray-900">Articles tagged with {tag}</h1>
          <p className="mt-2 text-sm text-gray-700">
            A collection of articles tagged with {tag} from our community.
          </p>
        </Setting>
        </div>
      </div>
      <ArticleList tag={tag} />
    </div>
  )
} 