export default function SkeletonFooter() {
  return (
    <div className="overflow-hidden animate-pulse">
      <div className="py-6">
        
        <div className="flex items-center justify-between pt-4 border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
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