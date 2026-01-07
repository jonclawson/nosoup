'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'
import { useSession } from 'next-auth/react'
import { useDocument } from '@/hooks/useDocument'
import styles from './page.module.css' 

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface EditUserPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const resolvedParams = use(params)
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  useDocument({ title: 'Edit User' })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('User not found')
        }
        const userData = await response.json()
        setUser(userData)
        setFormData({
          name: userData.name,
          email: userData.email,
          role: userData.role
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoadingUser(false)
      }
    }

    fetchUser()
  }, [resolvedParams.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/users/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      router.push(`/users/${resolvedParams.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingUser) {
    return (
      <div className={styles['user-edit-page__loading']}>
        <div className={styles['user-edit-page__loading__inner']}>
          <div className={styles['user-edit-page__loading__text']}>Loading user...</div>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className={styles['user-edit-page__error']}>
        <div className={styles['user-edit-page__error__inner']}>
          <div className={styles['user-edit-page__error__text']}>{error}</div>
          <Link href="/users" className={styles['user-edit-page__back-link']}>
            Back to Users
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles['user-edit-page']}>
      <div className={styles['user-edit-page__header']}>
        <Link
          href={`/users/${resolvedParams.id}`}
          className={styles['user-edit-page__back-link']}
        >
          ← Back to User Details
        </Link>
        <h1 className={styles['user-edit-page__title']}>Edit User</h1>
      </div> 

      <div className={styles['user-edit-page__card']}>
        <div className={styles['user-edit-page__card-body']}> 
          <form onSubmit={handleSubmit}>
            {error && (
              <div className={styles['user-edit-page__form-error']}>
                <div className={styles['user-edit-page__form-error__text']}>{error}</div>
              </div>
            )} 

            <div className={styles['user-edit-page__form']}>
              <div className={styles['user-edit-page__field']}>
                <label htmlFor="name" className={styles['user-edit-page__label']}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles['user-edit-page__input']}
                />
              </div> 

              <div className={styles['user-edit-page__field']}>
                <label htmlFor="email" className={styles['user-edit-page__label']}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles['user-edit-page__input']}
                />
              </div> 

              {session && session.user && session.user.role === 'admin' && (
              <div className={styles['user-edit-page__field']}>
                <label htmlFor="role" className={styles['user-edit-page__label']}>
                  Role
                </label>
                <select
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={styles['user-edit-page__select']}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              )} 
            </div>

            <div className={styles['user-edit-page__actions']}>
              <Link
                href={`/users/${resolvedParams.id}`}
                className={styles['user-edit-page__cancel-btn']}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className={styles['user-edit-page__submit-btn']}
              >
                {isLoading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 