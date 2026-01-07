import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import UserList from '@/components/UserList'
import styles from './page.module.css'
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Users',
  description: 'Manage the users of your application.',
}

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Serialize dates to strings to prevent hydration mismatches
  const serializedUsers = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  }))

  return (
    <div className={styles['users-page']}>
      <div className={styles['users-page__header']}>
        <div className={styles['users-page__header__content']}>
          <h1 className={styles['users-page__title']}>Users</h1>
          <p className={styles['users-page__desc']}>
            A list of all users in your application.
          </p>
        </div>
        <div className={styles['users-page__actions']}>
          <Link
            href="/users/new"
            className={styles['users-page__actions__add']}
          >
            Add user
          </Link>
        </div>
      </div>
      <UserList users={serializedUsers} />
    </div>
  )
} 