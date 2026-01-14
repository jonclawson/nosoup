'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import SkeletonLine from './SkeletonLine'
import styles from './AuthStatus.module.css' 
import Setting from './Setting'

export default function AuthStatus() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <SkeletonLine />
    )
  }

  if (session) {
    return (
      <div className={styles['auth-status']}>
        <Link
          href={`/users/${session.user.id}`}
          className={styles['auth-status__profile']}
          title={session.user.name}
        >
          Profile 
        </Link>
        <Link
          href="#"
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className={styles['auth-status__signout']}
        >
          Sign Out
        </Link> 
        <Setting title="Show Sign In" setting="show_auth_status" type="show">
          <span className={styles['auth-status__show-signin']}>
          </span>
        </Setting>
      </div>
    )
  }

  return (
    <Setting title="Show Sign In" setting="show_auth_status" type="show" loading={true}>      
      <div className={styles['auth-status']}>
        <Link
          href="/auth/login"
          className={styles['auth-status__link']}
        >
          Sign In
        </Link>
        <Link
          href="/auth/register"
          className={styles['auth-status__signup']}
        >
          Sign Up
        </Link>
      </div>
    </Setting>
  )
} 