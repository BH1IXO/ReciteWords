export default function Progress({
  mastered,
  total,
}: {
  mastered: number
  total: number
}) {
  const percent = total === 0 ? 0 : Math.round((mastered / total) * 100)

  return (
    <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">今日进度</span>
        <span className="text-sm font-semibold text-indigo-600">
          已掌握 {mastered} / 总共 {total}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-400 mt-1">{percent}%</div>
    </div>
  )
}
