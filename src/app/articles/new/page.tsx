'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EditArticleFields from '@/components/EditArticleFields'
import type { Article, Field, Author, FieldType } from '@/lib/types'
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"

export default function NewArticlePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<Article>({ title: '', body: '', fields: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual')

  const uploadFile = async (file: File): Promise<string | Record<string, any>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result); // This is the base64 string
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file); // Converts the file to a Data URL
    });
  };
  const editor = useCreateBlockNote({
    uploadFile,
  })

  const toggleEditorMode = async () => {
    if (editorMode === 'visual') {
      // Switch to HTML mode: convert editor content to HTML
      const htmlContent = await editor.blocksToFullHTML(editor.document)
      setFormData({ ...formData, body: htmlContent })
      setEditorMode('html')
    } else {
      // Switch to visual mode: parse HTML back to blocks
      const blocks = await editor.tryParseHTMLToBlocks(formData.body)
      editor.replaceBlocks(editor.document, blocks)
      setEditorMode('visual')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const fd = new FormData();
    fd.append('title', formData.title);
    
    // Convert BlockNote content to HTML
    const htmlContent = await editor.blocksToFullHTML(editor.document)
    fd.append('body', htmlContent);
    
    formData.fields.forEach((field, index) => {
      if (field.meta && field.meta.file) {
        fd.append(`files[${index}]`, field.meta.file);
      }
    });
    fd.append('fields', JSON.stringify(formData.fields));

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        body: fd
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create article')
      }

      router.push('/articles')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/articles"
          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          ← Back to Articles
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Write New Article</h1>
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
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <button
                    type="button"
                    onClick={toggleEditorMode}
                    className="text-xs px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    {editorMode === 'visual' ? '< > HTML' : '📝 Visual'}
                  </button>
                </div>
                {editorMode === 'visual' ? (
                  <div className="mt-1">
                    <BlockNoteView editor={editor} theme="light" />
                  </div>
                ) : (
                  <textarea
                    name="body"
                    id="body"
                    rows={15}
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono text-xs"
                  />
                )}
              </div>

              <EditArticleFields formData={formData} setFormData={setFormData} />
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <Link
                href="/articles"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Publishing...' : 'Publish Article'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 