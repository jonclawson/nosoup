'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Navigation() {
  const { data: session, status, update } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        {session.user?.role === 'admin' && (
          <Link
            href="/users"
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Users
          </Link>
        )}
        <Link
          href="/articles"
          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
        >
          Articles
        </Link>
      </div>
    )
  }

  return null
} 