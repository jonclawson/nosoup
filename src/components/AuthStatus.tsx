'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function AuthStatus() {
  const { data: session, status } = useSession()

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
        <Link
          href={`/users/${session.user.id}`}
          className="text-sm text-gray-700 hover:text-gray-900"
          title={session.user.name}
        >
          Profile 
        </Link>
        <Link
          href="#"
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
        >
          Sign Out
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <Link
        href="/auth/login"
        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
      >
        Sign In
      </Link>
      <Link
        href="/auth/register"
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        Sign Up
      </Link>
    </div>
  )
} 