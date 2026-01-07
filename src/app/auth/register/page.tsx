'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDocument } from '@/hooks/useDocument'
import styles from './page.module.css' 

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  useDocument({ title: 'Register' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Redirect to login page after successful registration
      router.push('/auth/login?message=Registration successful! Please sign in.')
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles['register-page']}>
      <div className={styles['register-page__container-sm']}>
        <h2 className={styles['register-page__title']}>
          Create your account
        </h2>
        <p className={styles['register-page__subtitle']}>
          Or{' '}
          <Link
            href="/auth/login"
            className={styles['register-page__register']}
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className={styles['register-page__card']}>
        <div className={styles['register-page__card-body']}>
          <form className={styles['register-page__form']} onSubmit={handleSubmit}>
            {error && (
              <div className={styles['register-page__alert--error']}>
                <div className={styles['register-page__alert--error-text']}>{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="name" className={styles['register-page__label']}>
                Full name
              </label>
              <div className={styles['register-page__input-wrap']}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles['register-page__input']}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={styles['register-page__label']}>
                Email address
              </label>
              <div className={styles['register-page__input-wrap']}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles['register-page__input']}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={styles['register-page__label']}>
                Password
              </label>
              <div className={styles['register-page__input-wrap']}>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={styles['register-page__input']}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={styles['register-page__label']}>
                Confirm password
              </label>
              <div className={styles['register-page__input-wrap']}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={styles['register-page__input']}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={styles['register-page__submit']}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 