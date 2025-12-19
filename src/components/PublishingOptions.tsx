'use client'
import { Article } from "@/lib/types";

export default function PublishingOptions({ formData, setFormData }: { formData: Article, setFormData: any }) {
  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900">Publishing Options</h3>
      <div className="mt-4 space-y-4">
        <p className="text-sm text-gray-500">
          Here you can manage the publishing settings for your article, including publication status, featured, and sticky options.
        </p>
        <div className="flex items-center">
          <input
            id="published"
            name="published"
            type="checkbox"
            checked={!!formData.published}
            onChange={(e) => setFormData({ ...formData, published: !!e.target.checked })}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
            Published
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="sticky"
            name="sticky"
            type="checkbox"
            checked={!!formData.sticky}
            onChange={(e) => setFormData({ ...formData, sticky: !!e.target.checked })}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="sticky" className="ml-2 block text-sm text-gray-700">
            Sticky (Keep this article at the top)
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            checked={!!formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: !!e.target.checked })}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
            Featured (Highlight this article)
          </label>
        </div>
      </div>
    </div>
  )
}