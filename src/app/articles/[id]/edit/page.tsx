'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'
import type { Article, Field, Author, FieldType, Tag } from '@/lib/types'
import { useCreateBlockNote } from "@blocknote/react"
import "@blocknote/mantine/style.css"
import ArticleForm from '@/components/ArticleForm'


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
    fields: [] as Field[],
    tags: [] as Tag[],
    published: false,
    sticky: false,
    featured: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoadingArticle, setIsLoadingArticle] = useState(true)
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
          fields: articleData.fields,
          tags: articleData.tags || [],
          published: articleData.published,
          sticky: articleData.sticky,
          featured: articleData.featured,
        })
        
        // Load HTML content into BlockNote editor
        if (articleData.body && editor) {
          const blocks = await editor.tryParseHTMLToBlocks(articleData.body)
          editor.replaceBlocks(editor.document, blocks)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoadingArticle(false)
      }
    }

    fetchArticle()
  }, [resolvedParams.id])

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
    fd.append('tags', JSON.stringify(formData.tags));
    fd.append('published', String(formData.published || false));
    fd.append('sticky', String(formData.sticky || false));
    fd.append('featured', String(formData.featured || false));
    try {
      const response = await fetch(`/api/articles/${resolvedParams.id}`, {
        method: 'PUT',
        body: fd,
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
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <ArticleForm 
          formData={formData} 
          setFormData={setFormData} 
          error={error} 
          isLoading={isLoading} 
          handleSubmit={handleSubmit} 
          editorMode={editorMode} 
          toggleEditorMode={toggleEditorMode} 
          editor={editor} 
          />
        </div>
      </div>
    </div>
  )
} 