'use client'
export default function SkeletonArticle() {
  return (
    <div className="overflow-hidden animate-pulse">
      <div className="py-6">
        <div className="mb-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="flex items-center text-sm mb-3">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="mx-2 h-4 bg-gray-200 rounded w-1"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="flex space-x-2">
            <div className="h-4 bg-gray-200 rounded w-8"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  )
}