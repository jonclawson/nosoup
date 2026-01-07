'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDocument } from '@/hooks/useDocument'
import styles from './page.module.css'

export default function NewUserPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  useDocument({ title: 'Create New User' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create user')
      }

      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles['new-user-page']}>
      <div className={styles['new-user-page__header']}>
        <Link
          href="/users"
          className={styles['new-user-page__back']}
        >
          ← Back to Users
        </Link>
        <h1 className={styles['new-user-page__title']}>Create New User</h1>
      </div>

      <div className={styles['new-user-page__card']}>
        <div className={styles['new-user-page__card-body']}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className={styles['new-user-page__error']}>
                <div className={styles['new-user-page__error__text']}>{error}</div>
              </div>
            )}

            <div className={styles['new-user-page__form']}>
              <div>
                <label htmlFor="name" className={styles['new-user-page__label']}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles['new-user-page__input']}
                />
              </div>

              <div>
                <label htmlFor="email" className={styles['new-user-page__label']}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles['new-user-page__input']}
                />
              </div>

              <div>
                <label htmlFor="role" className={styles['new-user-page__label']}>
                  Role
                </label>
                <select
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={styles['new-user-page__input']}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
            </div>

            <div className={styles['new-user-page__actions']}>
              <Link
                href="/"
                className={styles['new-user-page__cancel']}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className={styles['new-user-page__submit']}
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 