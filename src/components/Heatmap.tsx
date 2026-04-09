interface DayData {
  date: string
  count: number
}

interface HeatmapProps {
  data: DayData[]
}

const CELL = 12
const GAP = 3
const STEP = CELL + GAP

function getColor(count: number): string {
  if (count === 0) return '#ebedf0'
  if (count <= 2) return '#c7e3fc'
  if (count <= 5) return '#7db8f5'
  if (count <= 10) return '#3b82f6'
  return '#1d4ed8'
}

export default function Heatmap({ data }: HeatmapProps) {
  // Pad data to start from Monday of the first week
  const firstDate = data.length > 0 ? new Date(data[0].date) : new Date()
  const dayOfWeek = (firstDate.getDay() + 6) % 7 // Mon=0
  const paddedData: (DayData | null)[] = [
    ...Array(dayOfWeek).fill(null),
    ...data,
  ]

  const weeks = Math.ceil(paddedData.length / 7)
  const W = weeks * STEP - GAP
  const H = 7 * STEP - GAP

  const weekLabels = ['', '', '', '', '', '', '']
  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun']

  return (
    <div className="overflow-x-auto">
      <svg
        width={W + 32}
        height={H + 24}
        style={{ display: 'block' }}
      >
        {/* Day labels */}
        {dayLabels.map((label, i) => (
          <text
            key={i}
            x={0}
            y={i * STEP + CELL / 2 + 24}
            fontSize={8}
            fill="#9ca3af"
            dominantBaseline="middle"
          >
            {label}
          </text>
        ))}

        {/* Cells */}
        <g transform="translate(32, 16)">
          {paddedData.map((day, idx) => {
            const col = Math.floor(idx / 7)
            const row = idx % 7
            const x = col * STEP
            const y = row * STEP
            if (!day) {
              return (
                <rect
                  key={idx}
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill="#f3f4f6"
                />
              )
            }
            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx={2}
                fill={getColor(day.count)}
              >
                <title>{day.date}: {day.count} 次</title>
              </rect>
            )
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-1 justify-end">
        <span className="text-xs text-gray-400 mr-1">少</span>
        {['#ebedf0', '#c7e3fc', '#7db8f5', '#3b82f6', '#1d4ed8'].map((c) => (
          <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-xs text-gray-400 ml-1">多</span>
      </div>
    </div>
  )
}
