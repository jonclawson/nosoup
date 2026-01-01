'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import SkeletonLine from './SkeletonLine'
import Setting from './Setting'

export default function Navigation() {
  const { data: session, status, update } = useSession()

  if (status === 'loading') {
    return (
      <SkeletonLine />
    )
  }

    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/articles"
          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
        >
          <Setting type="text" setting="navigation_articles_link">Articles</Setting>
        </Link>
        {session && session.user?.role === 'admin' && (
          <Link
            href="/users"
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Users
          </Link>
        )}
      </div>
    )

} 