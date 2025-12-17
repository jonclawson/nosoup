'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'
import type { Article, Field, Author, FieldType } from '@/lib/types'


interface EditArticlePageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [article, setArticle] = useState<Article | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    fields: [] as Field[]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoadingArticle, setIsLoadingArticle] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('Article not found')
        }
        const articleData = await response.json()
        setArticle(articleData)
        setFormData({
          title: articleData.title,
          body: articleData.body,
          fields: articleData.fields
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoadingArticle(false)
      }
    }

    fetchArticle()
  }, [resolvedParams.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/articles/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update article')
      }

      router.push(`/articles/${resolvedParams.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (index: number, value: string) => {
    const updatedFields = [...formData.fields]
    updatedFields[index].value = value
    setFormData({ ...formData, fields: updatedFields })
  }

  const handleAddField = (type: FieldType) => {
    const newField: Field = { type: type, value: '' }
    setFormData({ ...formData, fields: [...formData.fields, newField] })
  }

  const handleRemoveField = (index: number) => {
    const updatedFields = [...formData.fields]
    updatedFields.splice(index, 1)
    setFormData({ ...formData, fields: updatedFields })
  }

  if (isLoadingArticle) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="text-gray-500">Loading article...</div>
        </div>
      </div>
    )
  }

  if (error && !article) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="text-red-500">{error}</div>
          <Link href="/articles" className="text-blue-600 hover:text-blue-900 mt-4 inline-block">
            Back to Articles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href={`/articles/${resolvedParams.id}`}
          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          ← Back to Article
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Edit Article</h1>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  name="body"
                  id="body"
                  rows={10}
                  required
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="fields" className="block text-sm font-medium text-gray-700">
                  Fields
                </label>
                <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-4 bg-gray-50 text-sm text-gray-500">
                  {/* load each field value of fields in inputs */}
                  {formData?.fields && formData.fields.length > 0 ? (
                    formData.fields.map((field, index) => (
                      <div key={index} className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">
                          {field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field
                          {/* circle with an x to remove field when clicked */}
                          <button
                            type="button"
                            onClick={() => handleRemoveField(index)}
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            &times;
                          </button>
                        </label>
                        {/* for type code, use textarea, for image, use file upload, for link, use input */}
                        {field.type === 'code' ? (
                          <textarea
                            name="fields[]"
                            id={field.id}
                            rows={6}
                            value={field.value}
                            onChange={(e) => handleFieldChange(index, e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm bg-white p-2"
                          />
                        ) : field.type === 'image' ? (
                          <input
                            name="fields[]"
                            id={field.id}
                            type="file"
                            value={field.value}
                            onChange={(e) => handleFieldChange(index, e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm bg-white p-2"
                          />
                        ) : field.type === 'link' ? (
                          <input
                            name="fields[]"
                            id={field.id}
                            type="text"
                            value={field.value}
                            onChange={(e) => handleFieldChange(index, e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm bg-white p-2"
                          />
                        ) : (
                          <input
                            name="fields[]"
                            id={field.id}
                            type="text"
                            value={field.value}
                            onChange={(e) => handleFieldChange(index, e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm bg-white p-2"
                          />
                        )}    
                      </div>
                    ))
                  ) : (
                    <div>No fields available.</div>
                  )}
                </div>
                {/* add field button */}
                {/* Change the button to be a select with values of code, image or link and resets the value on change */}
                <select
                  onChange={(e) => {
                    handleAddField(e.target.value as FieldType);
                    e.target.value = "";
                  }}
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <option value="">Add Field</option>
                  <option value="code">Code</option>
                  <option value="image">Image</option>
                  <option value="link">Link</option>
                </select>
              </div>
            </div>

            

            <div className="mt-6 flex items-center justify-end space-x-3">
              <Link
                href={`/articles/${resolvedParams.id}`}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Article'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 