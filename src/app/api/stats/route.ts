import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  // Today's mastered count (from StudyLog)
  const todayStart = new Date(today)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)

  const todayCount = await prisma.studyLog.count({
    where: {
      action: 'mastered',
      createdAt: { gte: todayStart, lte: todayEnd },
    },
  })

  // Total mastered words
  const totalMastered = await prisma.word.count({ where: { mastered: true } })

  // Level distribution
  const levelGroups = await prisma.word.groupBy({
    by: ['level'],
    _count: { id: true },
    orderBy: { level: 'asc' },
  })
  const levelDistribution = Array.from({ length: 5 }, (_, i) => ({
    level: i,
    count: levelGroups.find((g) => g.level === i)?._count.id ?? 0,
  }))

  // Daily activity for last 84 days (12 weeks)
  const since = new Date()
  since.setDate(since.getDate() - 83)
  since.setHours(0, 0, 0, 0)

  const logs = await prisma.studyLog.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  })

  const dailyMap: Record<string, number> = {}
  logs.forEach((log) => {
    const d = log.createdAt.toISOString().split('T')[0]
    dailyMap[d] = (dailyMap[d] ?? 0) + 1
  })

  // Build last 84 days array
  const dailyActivity = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().split('T')[0]
    return { date: key, count: dailyMap[key] ?? 0 }
  })

  // This week (Mon–today)
  const weekActivity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    return { date: key, count: dailyMap[key] ?? 0 }
  })

  // Streak: consecutive days with at least 1 log up to today
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    if ((dailyMap[key] ?? 0) > 0) {
      streak++
    } else {
      break
    }
  }

  return NextResponse.json({
    todayCount,
    totalMastered,
    streak,
    levelDistribution,
    dailyActivity,
    weekActivity,
  })
}
