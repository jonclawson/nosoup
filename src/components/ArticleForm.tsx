'use client'
import { Article } from "@/lib/types";
import EditArticleFields from "./EditArticleFields";
import TagsComponent from "./TagsComponent";
import PublishingOptions from "./PublishingOptions";
import Link from "next/link";
import { BlockNoteView } from "@blocknote/mantine";

export default function ArticleForm({ formData, setFormData, error, isLoading, handleSubmit, editorMode, toggleEditorMode, editor }: { formData: Article, setFormData: any, error: string | null, isLoading: boolean, handleSubmit: (e: React.FormEvent) => void, editorMode: 'visual' | 'html', toggleEditorMode: () => void, editor: any }) {
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