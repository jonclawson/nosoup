export default function SkeletonBody() {
  return (
    <div className="overflow-hidden animate-pulse">
      <div className="py-6">

        <div className="mb-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>

      </div>
    </div>
  )
}