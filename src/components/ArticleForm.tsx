'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Article, Field, Tag } from "@/lib/types";
import EditArticleFields from "./EditArticleFields";
import TagsComponent from "./TagsComponent";
import PublishingOptions from "./PublishingOptions";
import Link from "next/link";
import BlockNoteEditor from './BlockNoteEditor';
// import { useCreateBlockNote } from "@blocknote/react"
// import "@blocknote/mantine/style.css"
// import { BlockNoteView } from "@blocknote/mantine";

export default function ArticleForm({ articleData }: { articleData: Article }) {
  const router = useRouter()
  const [formData, setFormData] = useState<Article>({
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
    // const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual')
  
    // const uploadFile = async (file: File): Promise<string | Record<string, any>> => {
    //   return new Promise((resolve, reject) => {
    //     const reader = new FileReader();
    //     reader.onload = () => resolve(reader.result as string | Record<string, any> | PromiseLike<string | Record<string, any>>); // This is the base64 string
    //     reader.onerror = (error) => reject(error);
    //     reader.readAsDataURL(file); // Converts the file to a Data URL
    //   });
    // };
    // const editor = useCreateBlockNote({
    //   uploadFile,
    // })
  
    useEffect(() => {
      const loadArticle = async () => {
        try {
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
          // if (articleData.body && editor) {
          //   const blocks = await editor.tryParseHTMLToBlocks(articleData.body)
          //   editor.replaceBlocks(editor.document, blocks)
          // }
        } catch (err: any) {
          setError(err.message)
        } finally {
          setIsLoadingArticle(false)
        }
      }
  
      loadArticle()
    }, [articleData])
  
    // const toggleEditorMode = async () => {
    //   if (editorMode === 'visual') {
    //     // Switch to HTML mode: convert editor content to HTML
    //     const htmlContent = await editor.blocksToFullHTML(editor.document)
    //     setFormData({ ...formData, body: htmlContent })
    //     setEditorMode('html')
    //   } else {
    //     // Switch to visual mode: parse HTML back to blocks
    //     const blocks = await editor.tryParseHTMLToBlocks(formData.body)
    //     editor.replaceBlocks(editor.document, blocks)
    //     setEditorMode('visual')
    //   }
    // }
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      setError('')
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('body', formData.body);
      // Convert BlockNote content to HTML
      // const htmlContent = await editor.blocksToFullHTML(editor.document)
      // fd.append('body', htmlContent);
      
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
        const response = await fetch(`/api/articles/${articleData.id || ''}`, {
          method: articleData.id ? 'PUT' : 'POST',
          body: fd,
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update article')
        }
  
        router.push(`/articles/${articleData.id || ''}`)
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
  
  return (
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

        {/* <div>
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
              <BlockNoteView editor={editor} theme="light" onChange={(e) => console.log(e)}/>
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
        </div> */}
        <BlockNoteEditor value={formData.body} onChange={(value) => setFormData({ ...formData, body: value })} />

        <EditArticleFields formData={formData} setFormData={setFormData} />
        <TagsComponent formData={formData} setFormData={setFormData} />
        <PublishingOptions formData={formData} setFormData={setFormData} />
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
  )
}