import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode')
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  if (mode === 'new') {
    const words = await prisma.word.findMany({
      where: { reviewAt: null },
      orderBy: { id: 'asc' },
    })
    return NextResponse.json(words)
  }

  if (mode === 'review') {
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    const words = await prisma.word.findMany({
      where: {
        AND: [
          { reviewAt: { not: null } },
          { reviewAt: { lte: todayEnd } },
          { mastered: true },
        ],
      },
      orderBy: { reviewAt: 'asc' },
    })
    return NextResponse.json(words)
  }

  // Default: filter by studyDate (original behavior)
  const words = await prisma.word.findMany({
    where: { studyDate: date },
    orderBy: { id: 'asc' },
  })
  return NextResponse.json(words)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { english, chinese, phonetic } = body
  const today = new Date().toISOString().split('T')[0]

  const word = await prisma.word.create({
    data: { english, chinese, phonetic, studyDate: today },
  })

  return NextResponse.json(word, { status: 201 })
}
