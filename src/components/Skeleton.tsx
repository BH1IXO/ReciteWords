export default function Skeleton() {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-80 bg-gray-200 rounded-3xl" />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <div className="flex-1 h-14 bg-gray-100 rounded-2xl" />
        <div className="flex-1 h-14 bg-indigo-100 rounded-2xl" />
      </div>

      {/* Progress */}
      <div className="mt-4 bg-white rounded-2xl px-5 py-4 shadow-sm">
        <div className="flex justify-between mb-2">
          <div className="h-4 w-16 bg-gray-100 rounded" />
          <div className="h-4 w-28 bg-gray-100 rounded" />
        </div>
        <div className="h-2 bg-gray-100 rounded-full" />
      </div>
    </div>
  )
}
