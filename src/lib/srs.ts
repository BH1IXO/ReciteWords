const INTERVALS = [1, 3, 7, 14, 30] // days

export function getNextReviewDate(level: number): Date {
  const days = INTERVALS[Math.min(level, INTERVALS.length - 1)]
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(0, 0, 0, 0)
  return date
}
