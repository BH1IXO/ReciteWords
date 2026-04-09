'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Heatmap from '@/components/Heatmap'

interface Stats {
  todayCount: number
  totalMastered: number
  streak: number
  levelDistribution: { level: number; count: number }[]
  dailyActivity: { date: string; count: number }[]
  weekActivity: { date: string; count: number }[]
}

const LEVEL_LABELS = ['生疏', '初识', '熟悉', '掌握', '精通']
const LEVEL_COLORS = ['#e5e7eb', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6']
const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data: Stats) => {
        setStats(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  if (!stats) return null

  const maxWeek = Math.max(...stats.weekActivity.map((d) => d.count), 1)
  const maxLevel = Math.max(...stats.levelDistribution.map((d) => d.count), 1)

  // SVG line chart for week activity
  const W = 280
  const H = 80
  const points = stats.weekActivity.map((d, i) => ({
    x: (i / 6) * (W - 20) + 10,
    y: H - 10 - ((d.count / maxWeek) * (H - 20)),
  }))
  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="max-w-md mx-auto px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">学习统计</h1>
        <Link
          href="/"
          className="text-sm text-indigo-500 font-medium px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors"
        >
          返回学习
        </Link>
      </div>

      {/* Top 3 cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: '今日已学', value: stats.todayCount, unit: '个' },
          { label: '累计掌握', value: stats.totalMastered, unit: '词' },
          { label: '连续学习', value: stats.streak, unit: '天' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-indigo-600">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{unit}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Week line chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">本周每日学习</h2>
        <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`}>
          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio) => (
            <line
              key={ratio}
              x1={10} y1={H - 10 - ratio * (H - 20)}
              x2={W - 10} y2={H - 10 - ratio * (H - 20)}
              stroke="#f3f4f6" strokeWidth={1}
            />
          ))}
          {/* Area fill */}
          <polyline
            points={[
              `${points[0].x},${H - 10}`,
              ...points.map((p) => `${p.x},${p.y}`),
              `${points[points.length - 1].x},${H - 10}`,
            ].join(' ')}
            fill="#eff6ff"
            stroke="none"
          />
          {/* Line */}
          <polyline
            points={polyline}
            fill="none"
            stroke="#6366f1"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3} fill="#6366f1" />
          ))}
          {/* X labels */}
          {stats.weekActivity.map((d, i) => (
            <text
              key={i}
              x={points[i].x}
              y={H + 14}
              textAnchor="middle"
              fontSize={9}
              fill="#9ca3af"
            >
              {WEEK_DAYS[new Date(d.date + 'T00:00:00').getDay()]}
            </text>
          ))}
        </svg>
      </div>

      {/* Level distribution */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">掌握程度分布</h2>
        <div className="space-y-2">
          {stats.levelDistribution.map(({ level, count }) => (
            <div key={level} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-8 shrink-0">{LEVEL_LABELS[level]}</span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(count / maxLevel) * 100}%`,
                    backgroundColor: LEVEL_COLORS[level],
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 w-6 text-right shrink-0">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">近 12 周学习热力图</h2>
        <Heatmap data={stats.dailyActivity} />
      </div>

      {/* Nav to manage */}
      <div className="mt-4 text-center">
        <Link href="/manage" className="text-sm text-indigo-400 hover:underline">
          去管理单词 →
        </Link>
      </div>
    </div>
  )
}
