'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useDocument } from '@/hooks/useDocument'
import styles from './page.module.css' 

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

interface UserPageProps {
  params: Promise<{
    id: string
  }>
}

export default function UserPage({ params }: UserPageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useDocument({ title: 'Profile - User Details' })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${resolvedParams.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found')
          } else {
            setError('Failed to fetch user')
          }
          return
        }
        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        setError('Failed to fetch user')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className={styles['user-page__loading']}>
        <div className={styles['user-page__loading__inner']}>
          <div className={styles['user-page__loading__text']}>Loading user...</div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className={styles['user-page__error']}>
        <div className={styles['user-page__error__inner']}>
          <div className={styles['user-page__error__text']}>{error || 'User not found'}</div>
          <Link href="/users" className={styles['user-page__back-link']}>
            Back to Users
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles['user-page']}>
      <div className={styles['user-page__header']}>
        <Link
          href="/users"
          className={styles['user-page__back-link']}
        >
          ← Back to Users
        </Link>
        <h1 className={styles['user-page__title']}>User Details</h1>
      </div> 

      <div className={styles['user-page__card']}>
        <div className={styles['user-page__card-body']}>
          <h3 className={styles['user-page__name']}>
            {user.name}
          </h3>
          <p className={styles['user-page__desc']}>
            User information and details.
          </p>
        </div>
        <div className={styles['user-page__divider']}> 
          <dl>
            <div className={styles['user-page__row--gray']}>
              <dt className={styles['user-page__dt']}>Full name</dt>
              <dd className={styles['user-page__dd']}>
                {user.name}
              </dd>
            </div> 
            <div className={styles['user-page__row--white']}>
              <dt className={styles['user-page__dt']}>Email address</dt>
              <dd className={styles['user-page__dd']}>
                {user.email}
              </dd>
            </div> 
            <div className={styles['user-page__row--gray']}>
              <dt className={styles['user-page__dt']}>Role</dt>
              <dd className={styles['user-page__dd']}>
                <span className={styles['user-page__role-badge']}>
                  {user.role}
                </span>
              </dd>
            </div> 
            <div className={styles['user-page__row--white']}>
              <dt className={styles['user-page__dt']}>Created</dt>
              <dd className={styles['user-page__dd']}>
                {new Date(user.createdAt).toLocaleString()}
              </dd>
            </div> 
            <div className={styles['user-page__row--gray']}>
              <dt className={styles['user-page__dt']}>Last updated</dt>
              <dd className={styles['user-page__dd']}>
                {new Date(user.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div> 

      <div className={styles['user-page__actions']}>
        <Link
          href={`/users/${user.id}/edit`}
          className={styles['user-page__edit-btn']}
        >
          Edit User
        </Link>
        <DeleteButton 
          userId={user.id} 
          onDelete={() => router.push('/users')}
          className={styles['user-page__delete-btn']}
        >
          Delete User
        </DeleteButton>
      </div>
    </div>
  )
} 