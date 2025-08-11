const LoadingSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
      </div>
      
      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;