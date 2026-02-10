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
  const { tag: rawTag } = use(params)
  const tag = decodeURIComponent(rawTag)
  useDocument({ title: `Articles tagged with ${tag}` })

  return (
    <div className="">
      <div className="section-outer">
        <div className="section">
          <Setting title="Show Articles Tagged Page Header" type="show" setting="show_articles_tagged_page_header">
          <div className="section-inner">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
              <Setting setting="articles_tagged_page_header">
                <h1 className="text-2xl text-gray-900">Articles tagged with {tag}</h1>
                <p className="mt-2 text-sm text-gray-700">
                  A collection of articles tagged with {tag} from our community.
                </p>
              </Setting>
              </div>
            </div>
          </div>
          </Setting>
        </div>
      </div>
      <ArticleList tag={tag} />
    </div>
  )
} 