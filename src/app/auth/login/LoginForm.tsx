'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useDocument } from '@/hooks/useDocument'
import styles from './LoginForm.module.css' 

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  useDocument({ title: 'Login' })

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccess(message)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/articles')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles['login-form']}> 
      <div className={styles['login-form__container-sm']}>
        <h2 className={styles['login-form__title']}>
          Sign in to your account
        </h2>
        <p className={styles['login-form__subtitle']}>
          Or{' '}
          <Link
            href="/auth/register"
            className={styles['login-form__register']}
          >
            create a new account
          </Link>
        </p> 
      </div>

      <div className={styles['login-form__card']}>
        <div className={styles['login-form__card-body']}> 
          <form className={styles['login-form__form']} onSubmit={handleSubmit}>
            {error && (
              <div className={styles['login-form__alert--error']}>
                <div className={styles['login-form__alert--error-text']}>{error}</div>
              </div>
            )} 
            {success && (
              <div className={styles['login-form__alert--success']}>
                <div className={styles['login-form__alert--success-text']}>{success}</div>
              </div>
            )} 

            <div>
              <label htmlFor="email" className={styles['login-form__label']}>
                Email address
              </label>
              <div className={styles['login-form__input-wrap']}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles['login-form__input']}
                />
              </div>
            </div> 

            <div>
              <label htmlFor="password" className={styles['login-form__label']}>
                Password
              </label>
              <div className={styles['login-form__input-wrap']}>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={styles['login-form__input']}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={styles['login-form__submit']}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 