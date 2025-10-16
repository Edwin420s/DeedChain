const PropertySkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card animate-pulse">
          {/* Image/Header Skeleton */}
          <div className="h-48 bg-gray-700 rounded-lg mb-4"></div>
          
          {/* Title Skeleton */}
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
          
          {/* Details Skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6"></div>
          </div>
          
          {/* Status Badge Skeleton */}
          <div className="h-6 bg-gray-700 rounded w-20 mb-4"></div>
          
          {/* Button Skeleton */}
          <div className="flex space-x-3">
            <div className="flex-1 h-10 bg-gray-700 rounded"></div>
            <div className="flex-1 h-10 bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PropertySkeleton